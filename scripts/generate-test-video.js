#!/usr/bin/env node
/**
 * Test video generation script for moyo channel
 * Topic: Why Engineers Have Higher Depression Rates
 * Style: Psych2Go / Sisyphus55 hybrid
 *
 * Usage: node scripts/generate-test-video.js
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOPIC = 'Why Engineers Have Higher Depression Rates — The Psychology Behind Tech Burnout';
const OUTPUT_SCRIPT = path.join(__dirname, '..', 'data', 'scripts', 'test-video.json');
const OUTPUT_THUMBNAIL = path.join(__dirname, '..', 'data', 'assets', 'test-thumbnail.png');

async function generateScript() {
  console.log('[1/3] Generating script with GPT-4...');

  const systemPrompt = `You are a YouTube scriptwriter for a psychology/mental health channel called "moyo".
Your style blends:
- Psych2Go: warm, accessible, illustrated psychology content with gentle AI narration
- Sisyphus55: philosophical depth, introspective storytelling, existential themes

Rules:
- Write in English
- Target length: 8-10 minutes of narration (~1400-1800 words)
- Use second person ("you") to connect with the viewer
- Include specific psychology research, studies, and statistics (cite real ones)
- Weave in relatable anecdotes and scenarios engineers would recognize
- Avoid clickbait fluff — deliver real insight
- Tone: empathetic, intelligent, slightly melancholic but ultimately hopeful
- Each section should have visual direction notes in [brackets] for the illustrator
- The hook must stop a scrolling engineer in their tracks within 3 seconds`;

  const userPrompt = `Write a complete YouTube video script on: "${TOPIC}"

Return a JSON object with this exact structure:
{
  "title": "scroll-stopping title (under 70 chars)",
  "hook": {
    "text": "opening line (first 3-5 seconds, must be arresting)",
    "visual_note": "visual direction for this moment"
  },
  "sections": [
    {
      "heading": "section name",
      "narration": "full narration text for this section",
      "visual_notes": "visual direction for illustrator",
      "duration_estimate_seconds": number
    }
  ],
  "outro": {
    "narration": "closing narration",
    "cta": "call to action text"
  },
  "metadata": {
    "total_word_count": number,
    "estimated_duration_minutes": number,
    "target_audience": "description",
    "key_studies_referenced": ["study1", "study2"]
  }
}

Structure the sections as:
1. Hook (3-5s)
2. The Silent Epidemic — framing the problem with stats
3. The Perfectionism Trap — why engineering attracts perfectionists
4. The Isolation Paradox — surrounded by people, deeply alone
5. Imposter Syndrome in Tech — never feeling good enough
6. The Optimization Mindset Backfires — treating yourself like code
7. Burnout Is Not Laziness — the neuroscience
8. What Actually Helps — evidence-based strategies
9. Outro — hopeful, philosophical close

Return ONLY valid JSON, no markdown fences.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const script = JSON.parse(response.choices[0].message.content);
  return script;
}

async function generateSEO(script) {
  console.log('[2/3] Generating SEO metadata...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a YouTube SEO expert. Return ONLY valid JSON, no markdown fences.',
      },
      {
        role: 'user',
        content: `Given this video title: "${script.title}"
And topic: "${TOPIC}"

Generate YouTube SEO metadata as JSON:
{
  "optimized_title": "SEO-optimized title (max 70 chars, include power word + year if relevant)",
  "description": "full YouTube description (2000+ chars, include timestamps, keywords, links placeholder)",
  "tags": ["tag1", "tag2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "category": "Education",
  "default_language": "en"
}

Focus on: tech burnout, engineer depression, psychology, mental health, imposter syndrome.
Include long-tail keywords. Max 30 tags, max 15 hashtags.`,
      },
    ],
    temperature: 0.6,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateThumbnail(script) {
  console.log('[3/3] Generating thumbnail with DALL-E 3...');

  const prompt = `A Psych2Go-style illustration for a YouTube thumbnail about engineer depression and tech burnout.

Style: Soft pastel colors, gentle anime-inspired illustration, clean lines.
Scene: A young person (gender-neutral) sitting alone at a desk with multiple monitors showing code, head resting on hand, looking exhausted.
The room is dark except for the blue glow of screens. A subtle shadow figure looms behind them representing depression.
Above their head, thought bubbles show: error messages, deadlines, "not good enough".
Color palette: deep blue and purple tones with warm orange/amber accents from the screen glow.
The illustration should evoke empathy, not pity. Beautiful but melancholic.

IMPORTANT: No text in the image. Clean illustration only. YouTube thumbnail aspect ratio 16:9.`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
    style: 'vivid',
  });

  const imageUrl = response.data[0].url;

  // Download the image
  const https = require('https');
  const http = require('http');
  return new Promise((resolve, reject) => {
    const client = imageUrl.startsWith('https') ? https : http;
    client.get(imageUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        const redirectClient = res.headers.location.startsWith('https') ? https : http;
        redirectClient.get(res.headers.location, (redirectRes) => {
          const chunks = [];
          redirectRes.on('data', (chunk) => chunks.push(chunk));
          redirectRes.on('end', () => {
            fs.writeFileSync(OUTPUT_THUMBNAIL, Buffer.concat(chunks));
            resolve(response.data[0].revised_prompt);
          });
          redirectRes.on('error', reject);
        });
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        fs.writeFileSync(OUTPUT_THUMBNAIL, Buffer.concat(chunks));
        resolve(response.data[0].revised_prompt);
      });
      res.on('error', reject);
    });
  });
}

async function main() {
  console.log('=== moyo channel - Test Video Generation ===');
  console.log(`Topic: ${TOPIC}\n`);

  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not set in .env');
    process.exit(1);
  }

  // Ensure output directories exist
  fs.mkdirSync(path.dirname(OUTPUT_SCRIPT), { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT_THUMBNAIL), { recursive: true });

  // Step 1: Generate script
  const script = await generateScript();
  console.log(`  Script generated: ${script.metadata?.total_word_count || '?'} words, ~${script.metadata?.estimated_duration_minutes || '?'} minutes\n`);

  // Step 2: Generate SEO
  const seo = await generateSEO(script);
  console.log(`  SEO title: ${seo.optimized_title}`);
  console.log(`  Tags: ${seo.tags?.length || 0} tags, ${seo.hashtags?.length || 0} hashtags\n`);

  // Step 3: Generate thumbnail
  const revisedPrompt = await generateThumbnail(script);
  console.log(`  Thumbnail saved to: ${OUTPUT_THUMBNAIL}\n`);

  // Combine everything into final output
  const output = {
    generated_at: new Date().toISOString(),
    topic: TOPIC,
    script,
    seo,
    thumbnail: {
      path: OUTPUT_THUMBNAIL,
      dall_e_revised_prompt: revisedPrompt,
    },
  };

  fs.writeFileSync(OUTPUT_SCRIPT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n=== Generation Complete ===`);
  console.log(`Script: ${OUTPUT_SCRIPT}`);
  console.log(`Thumbnail: ${OUTPUT_THUMBNAIL}`);

  // Print script preview
  console.log(`\n--- Script Preview ---`);
  console.log(`Title: ${script.title}`);
  console.log(`Hook: ${script.hook?.text}`);
  if (script.sections) {
    script.sections.forEach((s, i) => {
      const words = s.narration ? s.narration.split(' ').length : 0;
      console.log(`  ${i + 1}. ${s.heading} (${words} words, ~${s.duration_estimate_seconds}s)`);
    });
  }
  console.log(`\n--- SEO Preview ---`);
  console.log(`Title: ${seo.optimized_title}`);
  console.log(`Tags: ${seo.tags?.slice(0, 5).join(', ')}...`);
  console.log(`Hashtags: ${seo.hashtags?.slice(0, 5).join(' ')}...`);
}

main().catch((err) => {
  console.error('Generation failed:', err.message);
  if (err.response) {
    console.error('API response:', err.response.data || err.response.status);
  }
  process.exit(1);
});
