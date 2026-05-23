const path = require('path');
const { Logger } = require('../utils/logger');
const { ChannelDataCollector } = require('../utils/channel-data-collector');
const {
  classifyVideo,
  runFullAnalysis,
} = require('../utils/demand-analyzer');

const DEMAND_CACHE_PATH = path.join(__dirname, '..', 'data', 'analysis', 'channel-data.json');

class ContentStrategyAgent {
  constructor(db, credentials) {
    this.db = db;
    this.credentials = credentials;
    this.logger = new Logger('ContentStrategy');
    this.trendingTopics = [];
    this.competitorData = [];
    this.demandAnalysis = null;
    this.contentCalendar = [];
  }

  async initialize() {
    this.logger.info('Initializing Content Strategy Agent...');
    await this.loadHistoricalData();
    await this.analyzeTrends();
    return true;
  }

  async loadHistoricalData() {
    try {
      const history = await this.db.getContentHistory();
      this.historicalPerformance = history;
    } catch (error) {
      this.logger.warn('No historical data found, starting fresh');
      this.historicalPerformance = [];
    }
  }

  async analyzeTrends() {
    try {
      const trends = await this.fetchYouTubeTrends();
      await this.collectDemandData();
      this.trendingTopics = this.mergeTrendData(trends);
      this.logger.info(`Identified ${this.trendingTopics.length} trending topics`);
    } catch (error) {
      this.logger.error('Error analyzing trends:', error);
    }
  }

  async fetchYouTubeTrends() {
    const youtube = this.credentials.getYouTubeClient();

    try {
      const response = await youtube.videos.list({
        part: 'snippet,statistics',
        chart: 'mostPopular',
        maxResults: 50,
        regionCode: process.env.YOUTUBE_REGION || 'US',
      });

      return response.data.items.map(video => ({
        title: video.snippet.title,
        tags: video.snippet.tags || [],
        viewCount: parseInt(video.statistics.viewCount),
        category: video.snippet.categoryId,
        publishedAt: video.snippet.publishedAt,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch YouTube trends:', error);
      return [];
    }
  }

  async collectDemandData() {
    const youtube = this.credentials.getYouTubeClient();
    const collector = new ChannelDataCollector(youtube);

    let channelData;
    if (!collector.isCacheStale(DEMAND_CACHE_PATH)) {
      channelData = collector.loadFromFile(DEMAND_CACHE_PATH);
      this.logger.info('Using cached channel data');
    } else {
      this.logger.info('Collecting fresh channel data...');
      channelData = await collector.collectChannelData();
      collector.saveToFile(channelData, DEMAND_CACHE_PATH);
    }

    if (channelData && channelData.channels && channelData.channels.length > 0) {
      this.demandAnalysis = runFullAnalysis(channelData);
      this.logger.info(`Demand analysis: ${this.demandAnalysis.topicRanking.length} topics ranked`);
    }
  }

  mergeTrendData(trends) {
    const mergedTopics = new Map();

    // Add YouTube trending topics classified by our rules
    for (const trend of trends) {
      const topics = classifyVideo(trend.title, trend.tags);
      for (const topic of topics) {
        if (!mergedTopics.has(topic)) {
          mergedTopics.set(topic, { score: 0, sources: [], demandPR: 0, opportunity: 0, trendDirection: 'stable' });
        }
        const data = mergedTopics.get(topic);
        data.score += trend.viewCount / 1000000;
        data.sources.push('trending');
      }
    }

    // Enrich with demand analysis data
    if (this.demandAnalysis) {
      for (const ranking of this.demandAnalysis.topicRanking) {
        if (!mergedTopics.has(ranking.topic)) {
          mergedTopics.set(ranking.topic, { score: 0, sources: [], demandPR: 0, opportunity: 0, trendDirection: 'stable' });
        }
        const data = mergedTopics.get(ranking.topic);
        data.score += ranking.avgPR * 100;
        data.demandPR = ranking.avgPR;
        data.sources.push('demand-analysis');
      }

      for (const opp of this.demandAnalysis.opportunities) {
        if (mergedTopics.has(opp.topic)) {
          mergedTopics.get(opp.topic).opportunity = opp.opportunity;
        }
      }

      for (const trend of this.demandAnalysis.recencyTrend) {
        if (mergedTopics.has(trend.topic)) {
          mergedTopics.get(trend.topic).trendDirection = trend.direction;
        }
      }
    }

    return Array.from(mergedTopics.entries())
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }

  async generateContentStrategy(requestedTopic = null) {
    try {
      let topic, angle;

      if (requestedTopic) {
        topic = requestedTopic;
        angle = await this.generateAngle(topic);
      } else {
        const selectedTopic = this.selectOptimalTopic();
        topic = selectedTopic.topic;
        angle = await this.generateAngle(topic);
      }

      const targetAudience = await this.identifyTargetAudience(topic);
      const contentType = this.selectContentType(topic);
      const demandMetrics = this.getDemandMetrics(topic);

      const strategy = {
        topic,
        angle,
        targetAudience,
        contentType,
        demandMetrics,
        estimatedViews: this.predictViews(topic),
        bestPublishTime: this.calculateBestPublishTime(),
        createdAt: new Date().toISOString(),
      };

      await this.db.saveContentStrategy(strategy);

      this.logger.info(`Generated strategy for: ${topic}`);
      return strategy;
    } catch (error) {
      this.logger.error('Failed to generate content strategy:', error);
      throw error;
    }
  }

  getDemandMetrics(topic) {
    const topicData = this.trendingTopics.find(t => t.topic === topic);
    const durationData = this.demandAnalysis
      ? this.demandAnalysis.durationSweetSpot.find(d => d.topic === topic)
      : null;

    return {
      performanceRatio: topicData ? topicData.demandPR : 0,
      opportunity: topicData ? topicData.opportunity : 0,
      trendDirection: topicData ? topicData.trendDirection : 'unknown',
      recommendedDuration: durationData ? durationData.topHalfDuration : null,
      durationAdvice: durationData ? durationData.recommendation : 'neutral',
    };
  }

  selectOptimalTopic() {
    const recentTopics = this.getRecentTopics();

    const scoredTopics = this.trendingTopics
      .filter(topic => !recentTopics.includes(topic.topic))
      .map(topic => {
        // Demand (avgPR): 40%, Opportunity: 25%, Trend momentum: 20%, Seasonal+Audience: 15%
        const demandScore = topic.demandPR * 0.4;
        const opportunityScore = topic.opportunity * 0.25;
        const trendScore = (topic.trendDirection === 'rising' ? 0.2 : topic.trendDirection === 'falling' ? 0.05 : 0.1);
        const contextScore = (this.getSeasonalMultiplier(topic.topic) * this.getAudienceMultiplier(topic.topic) - 1) * 0.15;

        return {
          ...topic,
          finalScore: demandScore + opportunityScore + trendScore + contextScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    return scoredTopics[0] || { topic: 'Technology Trends', score: 1 };
  }

  predictViews(topic) {
    if (!this.demandAnalysis) {
      const topicData = this.trendingTopics.find(t => t.topic === topic);
      const baseViews = topicData ? topicData.score * 10000 : 5000;
      return Math.floor(baseViews);
    }

    const ranking = this.demandAnalysis.topicRanking.find(t => t.topic === topic);
    if (!ranking) return 5000;

    const subscriberEstimate = parseInt(process.env.CHANNEL_SUBSCRIBERS || '10000');
    return Math.floor(ranking.avgPR * subscriberEstimate);
  }

  async generateAngle(topic) {
    const angles = [
      `The Ultimate Guide to ${topic}`,
      `${topic}: What Nobody Is Telling You`,
      `How ${topic} Will Change Everything in 2025`,
      `The Hidden Truth About ${topic}`,
      `${topic} Explained in 5 Minutes`,
      `Why ${topic} Is More Important Than You Think`,
      `${topic}: Expert Secrets Revealed`,
      `The Complete ${topic} Tutorial for Beginners`,
    ];
    return angles[Math.floor(Math.random() * angles.length)];
  }

  async identifyTargetAudience(topic) {
    const audiences = {
      tech: 'Tech enthusiasts, developers, early adopters',
      business: 'Entrepreneurs, business owners, professionals',
      education: 'Students, educators, lifelong learners',
      entertainment: 'General audience, entertainment seekers',
      lifestyle: 'Lifestyle enthusiasts, self-improvement seekers',
    };
    const category = this.categorize(topic);
    return audiences[category] || audiences.entertainment;
  }

  categorize(topic) {
    const categories = {
      tech: ['technology', 'software', 'app', 'ai', 'code', 'programming', 'crypto', 'blockchain'],
      business: ['business', 'money', 'finance', 'startup', 'entrepreneur', 'marketing'],
      education: ['learn', 'tutorial', 'how to', 'guide', 'course', 'study'],
      lifestyle: ['life', 'health', 'fitness', 'food', 'travel', 'fashion'],
    };

    const topicLower = topic.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => topicLower.includes(keyword))) {
        return category;
      }
    }
    return 'entertainment';
  }

  selectContentType(topic) {
    const types = [
      { type: 'Tutorial', suitableFor: ['how to', 'guide', 'learn'] },
      { type: 'List', suitableFor: ['best', 'top', 'worst'] },
      { type: 'Review', suitableFor: ['review', 'vs', 'comparison'] },
      { type: 'Explainer', suitableFor: ['what is', 'why', 'explained'] },
      { type: 'News', suitableFor: ['breaking', 'latest', 'new'] },
      { type: 'Story', suitableFor: ['story', 'journey', 'experience'] },
    ];

    const topicLower = topic.toLowerCase();
    for (const contentType of types) {
      if (contentType.suitableFor.some(keyword => topicLower.includes(keyword))) {
        return contentType.type;
      }
    }
    return 'Explainer';
  }

  calculateBestPublishTime() {
    const bestTimes = [
      { day: 'Tuesday', hour: 14 },
      { day: 'Wednesday', hour: 14 },
      { day: 'Thursday', hour: 14 },
      { day: 'Friday', hour: 15 },
      { day: 'Saturday', hour: 10 },
      { day: 'Sunday', hour: 10 },
    ];

    const selected = bestTimes[Math.floor(Math.random() * bestTimes.length)];
    const nextDate = this.getNextWeekday(selected.day);
    nextDate.setHours(selected.hour, 0, 0, 0);
    return nextDate.toISOString();
  }

  getNextWeekday(dayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayName);
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    return nextDate;
  }

  getRecentTopics() {
    return this.historicalPerformance
      .filter(content => {
        const contentDate = new Date(content.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return contentDate > weekAgo;
      })
      .map(content => content.topic);
  }

  getSeasonalMultiplier(topic) {
    const month = new Date().getMonth();
    const seasonalTopics = {
      winter: ['christmas', 'holiday', 'new year', 'winter'],
      spring: ['spring', 'easter', 'garden'],
      summer: ['summer', 'vacation', 'beach', 'travel'],
      fall: ['halloween', 'thanksgiving', 'autumn', 'back to school'],
    };

    const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';
    const topicLower = topic.toLowerCase();
    if (seasonalTopics[season].some(keyword => topicLower.includes(keyword))) {
      return 1.5;
    }
    return 1.0;
  }

  getAudienceMultiplier(topic) {
    const category = this.categorize(topic);
    const multipliers = {
      tech: 1.2,
      business: 1.1,
      education: 1.0,
      entertainment: 1.3,
      lifestyle: 1.15,
    };
    return multipliers[category] || 1.0;
  }
}

module.exports = { ContentStrategyAgent };
