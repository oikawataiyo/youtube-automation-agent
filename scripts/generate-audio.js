#!/usr/bin/env node
/**
 * Build timing manifest from manually-generated moyo audio files.
 *
 * Prerequisite: Use Voicebox (or any TTS tool) to generate MP3 files
 * and place them in data/audio/moyo/{slug}/ with these names:
 *   hook.mp3, section_0.mp3, section_1.mp3, ..., outro.mp3
 *
 * This script then:
 *   1. Verifies all expected MP3 files exist
 *   2. Gets duration of each via ffprobe
 *   3. Concatenates all into full_narration.mp3
 *   4. Writes timing-manifest.json
 *
 * Usage:
 *   node scripts/generate-audio.js data/scripts/spotlight-effect.json
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

function parseArgs() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Usage: node scripts/generate-audio.js <script-json-path>');
    process.exit(1);
  }
  return scriptPath;
}

/**
 * Extract expected segments from the script JSON.
 */
function extractSegments(scriptData) {
  const { script } = scriptData;
  const segments = [];

  if (script.hook?.text) {
    segments.push({
      id: 'hook',
      text: script.hook.text,
      filename: 'hook.mp3',
    });
  }

  for (let i = 0; i < (script.sections || []).length; i++) {
    const sec = script.sections[i];
    segments.push({
      id: `section_${i}`,
      heading: sec.heading,
      text: sec.narration,
      filename: `section_${i}.mp3`,
    });
  }

  if (script.outro) {
    const outroText = [script.outro.narration, script.outro.cta]
      .filter(Boolean)
      .join(' ');
    segments.push({
      id: 'outro',
      text: outroText,
      filename: 'outro.mp3',
    });
  }

  return segments;
}

async function getDuration(filePath) {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`
  );
  const duration = parseFloat(stdout.trim());
  if (isNaN(duration)) throw new Error(`ffprobe returned non-numeric duration for: ${filePath}`);
  return duration;
}

async function concatSegments(inputPaths, outputPath) {
  const listPath = outputPath.replace(/\.mp3$/, '_concat_list.txt');
  const listContent = inputPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listPath, listContent);

  try {
    await execAsync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`
    );
  } finally {
    try { fs.unlinkSync(listPath); } catch (_) {}
  }
}

async function main() {
  const scriptPath = parseArgs();
  const resolvedScriptPath = path.resolve(scriptPath);

  if (!fs.existsSync(resolvedScriptPath)) {
    console.error(`Script file not found: ${resolvedScriptPath}`);
    process.exit(1);
  }

  const scriptData = JSON.parse(fs.readFileSync(resolvedScriptPath, 'utf8'));
  const segments = extractSegments(scriptData);

  const slug = path.basename(resolvedScriptPath, '.json');
  const projectRoot = path.join(__dirname, '..');
  const audioDir = path.join(projectRoot, 'data', 'audio', 'moyo', slug);

  console.log(`=== moyo Audio Pipeline ===`);
  console.log(`Script:   ${scriptPath}`);
  console.log(`Slug:     ${slug}`);
  console.log(`Audio dir: ${audioDir}`);
  console.log(`Expected: ${segments.length} segment files`);
  console.log();

  // Verify all MP3 files exist
  const missing = segments.filter(s => !fs.existsSync(path.join(audioDir, s.filename)));
  if (missing.length > 0) {
    console.error('Missing audio files. Generate them with Voicebox and place in the audio dir:');
    for (const m of missing) {
      console.error(`  ${m.filename}  <- ${m.id}: "${m.text.slice(0, 80)}..."`);
    }
    process.exit(1);
  }

  // Get durations and build manifest segments
  const manifestSegments = [];

  for (const seg of segments) {
    const audioPath = path.join(audioDir, seg.filename);
    const relAudioPath = path.relative(projectRoot, audioPath).replace(/\\/g, '/');
    const durationSeconds = await getDuration(audioPath);
    const wordCount = seg.text.split(/\s+/).length;
    const preview = seg.text.slice(0, 60) + (seg.text.length > 60 ? '...' : '');

    const entry = {
      id: seg.id,
      audio_path: relAudioPath,
      duration_seconds: Math.round(durationSeconds * 10) / 10,
      word_count: wordCount,
      text_preview: preview,
    };
    if (seg.heading) entry.heading = seg.heading;

    manifestSegments.push(entry);
    console.log(`  ${seg.id}: ${durationSeconds.toFixed(1)}s, ${wordCount} words`);
  }

  // Concatenate all segments
  const fullAudioPath = path.join(audioDir, 'full_narration.mp3');
  const segmentPaths = segments.map(s => path.join(audioDir, s.filename));
  await concatSegments(segmentPaths, fullAudioPath);

  const fullDuration = await getDuration(fullAudioPath);
  const relFullPath = path.relative(projectRoot, fullAudioPath).replace(/\\/g, '/');

  const manifest = {
    script_file: path.relative(projectRoot, resolvedScriptPath).replace(/\\/g, '/'),
    segments: manifestSegments,
    total_duration_seconds: Math.round(fullDuration * 10) / 10,
    full_audio_path: relFullPath,
    generated_at: new Date().toISOString(),
  };

  const manifestPath = path.join(audioDir, 'timing-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Validation
  const segmentDurationSum = manifestSegments.reduce((sum, s) => sum + s.duration_seconds, 0);
  const drift = Math.abs(fullDuration - segmentDurationSum);

  console.log();
  console.log(`=== Results ===`);
  console.log(`Full narration: ${fullDuration.toFixed(1)}s (${(fullDuration / 60).toFixed(1)} min)`);
  console.log(`Segment sum:    ${segmentDurationSum.toFixed(1)}s`);
  console.log(`Drift:          ${drift.toFixed(2)}s`);
  if (drift > 1.0) {
    console.warn(`WARNING: Duration drift exceeds 1.0s threshold`);
  }
  console.log(`Manifest:       ${manifestPath}`);
  console.log(`Done.`);
}

main().catch(err => {
  console.error('Audio generation failed:', err.message);
  process.exit(1);
});
