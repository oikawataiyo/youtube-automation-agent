const fs = require('fs');
const path = require('path');

const DEFAULT_CHANNELS = [
  { name: 'Fireship',       id: 'UCsBjURrPoezykLs9EqgamOA' },
  { name: 'Theo - t3.gg',   id: 'UCbRP3c757lWg9M-U7TyEkXA' },
  { name: 'ThePrimeTime',   id: 'UCUyeluBRhGPCW4rPe_UvBZQ' },
  { name: 'NetworkChuck',   id: 'UC9x0AN7BWHpCDHSm9NiJFJQ' },
  { name: 'ByteByteGo',     id: 'UCZgt6AzoyjslHTC9dz0UoTw' },
  { name: 'Traversy Media', id: 'UC29ju8bIPH5as8OGnQzwJyA' },
];

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60) + parseInt(match[3] || 0);
}

class ChannelDataCollector {
  constructor(youtubeClient) {
    this.youtube = youtubeClient;
  }

  async collectChannelData(channels = DEFAULT_CHANNELS, videosPerChannel = 30) {
    const result = { collectedAt: new Date().toISOString(), channels: [] };

    for (const ch of channels) {
      const chRes = await this.youtube.channels.list({
        part: 'statistics,snippet',
        id: ch.id,
      });

      if (!chRes.data.items || chRes.data.items.length === 0) continue;

      const chData = chRes.data.items[0];
      const subs = parseInt(chData.statistics.subscriberCount);
      const totalViews = parseInt(chData.statistics.viewCount);

      const searchRes = await this.youtube.search.list({
        part: 'snippet',
        channelId: ch.id,
        maxResults: videosPerChannel,
        order: 'date',
        type: 'video',
      });

      const videoIds = searchRes.data.items
        .map(i => i.id.videoId)
        .filter(Boolean)
        .join(',');

      if (!videoIds) continue;

      const videosRes = await this.youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: videoIds,
      });

      const videos = videosRes.data.items.map(v => ({
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        tags: v.snippet.tags || [],
        views: parseInt(v.statistics.viewCount || '0'),
        likes: parseInt(v.statistics.likeCount || '0'),
        comments: parseInt(v.statistics.commentCount || '0'),
        duration: parseDuration(v.contentDetails.duration),
      }));

      result.channels.push({
        name: ch.name,
        id: ch.id,
        subscribers: subs,
        totalViews,
        videos,
      });
    }

    return result;
  }

  saveToFile(data, filePath) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  async collectViaPlaylist(channelId, maxVideos = 10) {
    const chRes = await this.youtube.channels.list({
      part: 'contentDetails,statistics,snippet',
      id: channelId,
    });

    if (!chRes.data.items || chRes.data.items.length === 0) return null;

    const chData = chRes.data.items[0];
    const uploadsPlaylistId = chData.contentDetails.relatedPlaylists.uploads;
    const subs = parseInt(chData.statistics.subscriberCount || '0');
    const totalViews = parseInt(chData.statistics.viewCount || '0');

    const playlistRes = await this.youtube.playlistItems.list({
      part: 'contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: maxVideos,
    });

    const videoIds = playlistRes.data.items
      .map(i => i.contentDetails.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return { channelId, name: chData.snippet.title, subscribers: subs, totalViews, publishedAt: chData.snippet.publishedAt, videos: [] };

    const videosRes = await this.youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
    });

    const videos = videosRes.data.items.map(v => ({
      id: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      tags: v.snippet.tags || [],
      views: parseInt(v.statistics.viewCount || '0'),
      likes: parseInt(v.statistics.likeCount || '0'),
      comments: parseInt(v.statistics.commentCount || '0'),
      duration: parseDuration(v.contentDetails.duration),
    }));

    return {
      channelId,
      name: chData.snippet.title,
      subscribers: subs,
      totalViews,
      publishedAt: chData.snippet.publishedAt,
      videos,
    };
  }

  isCacheStale(filePath, maxAgeHours = 24) {
    if (!fs.existsSync(filePath)) return true;
    const data = this.loadFromFile(filePath);
    if (!data || !data.collectedAt) return true;
    const ageMs = Date.now() - new Date(data.collectedAt).getTime();
    return ageMs > maxAgeHours * 3600000;
  }
}

module.exports = { ChannelDataCollector, DEFAULT_CHANNELS, parseDuration };
