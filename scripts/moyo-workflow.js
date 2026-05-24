#!/usr/bin/env node
/**
 * moyo channel production workflow orchestrator.
 * Interactive CLI that guides through the end-to-end video pipeline.
 *
 * Usage:
 *   node scripts/moyo-workflow.js                # show status
 *   node scripts/moyo-workflow.js --stage demand  # run specific stage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STAGES = [
  {
    id: 'demand',
    name: 'DEMAND ANALYSIS',
    description: 'Analyze psychology niche demand via YouTube API',
    command: 'node scripts/analyze-psychology-demand.js',
    output: 'data/analysis/psychology-demand.json',
  },
  {
    id: 'topic',
    name: 'TOPIC SELECTION',
    description: 'Select pillar + topic using demand data',
    command: 'node scripts/generate-script.js --use-demand',
    output: null,
  },
  {
    id: 'script',
    name: 'SCRIPT WRITING',
    description: 'Claude Code generates script (interactive)',
    command: null,
    output: 'data/scripts/',
    manual: 'Ask Claude Code to write the script using the moyo-script skill.',
  },
  {
    id: 'audio',
    name: 'AUDIO GENERATION',
    description: 'Text-to-speech via Voicebox',
    command: null,
    output: null,
    manual: 'Run Voicebox TTS on the script, then: node scripts/generate-audio.js',
  },
  {
    id: 'avatar',
    name: 'AVATAR ANIMATION',
    description: '3D anime avatar lip-sync (future)',
    command: null,
    output: null,
    manual: '(Future) Playwright + 3D anime studio pipeline.',
  },
  {
    id: 'visuals',
    name: 'VISUAL GENERATION',
    description: 'Background visuals and overlays (future)',
    command: null,
    output: null,
    manual: '(Future) DALL-E / StreamDiffusion for scene backgrounds.',
  },
  {
    id: 'composite',
    name: 'VIDEO COMPOSITE',
    description: 'Combine audio + avatar + visuals (future)',
    command: null,
    output: null,
    manual: '(Future) ffmpeg compositing pipeline.',
  },
  {
    id: 'seo',
    name: 'SEO REVIEW',
    description: 'Review metadata from script JSON',
    command: null,
    output: null,
    manual: 'Review title, description, tags in the script JSON file.',
  },
  {
    id: 'upload',
    name: 'UPLOAD',
    description: 'Upload to YouTube',
    command: null,
    output: null,
    manual: 'Upload via YouTube Studio (manual for now).',
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { stage: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stage' && args[i + 1]) {
      opts.stage = args[i + 1];
      i++;
    }
  }

  return opts;
}

function checkStageStatus(stage) {
  if (!stage.output) return 'manual';
  const fullPath = path.join(__dirname, '..', stage.output);
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      return files.length > 0 ? 'done' : 'pending';
    }
    return 'done';
  }
  return 'pending';
}

function printStatus() {
  console.log('=== moyo Production Workflow ===\n');

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const status = checkStageStatus(stage);
    const icon = status === 'done' ? '[x]' : status === 'manual' ? '[-]' : '[ ]';
    const runnable = stage.command ? `(run: --stage ${stage.id})` : '(manual)';

    console.log(`  ${icon} Stage ${i + 1}: ${stage.name}`);
    console.log(`       ${stage.description}`);
    console.log(`       ${runnable}`);

    if (stage.manual) {
      console.log(`       Note: ${stage.manual}`);
    }
    console.log();
  }
}

function runStage(stageId) {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) {
    console.error(`Unknown stage "${stageId}". Available: ${STAGES.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  if (!stage.command) {
    console.log(`Stage "${stage.name}" is manual.`);
    if (stage.manual) console.log(stage.manual);
    return;
  }

  console.log(`Running: ${stage.command}\n`);
  execSync(stage.command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

function main() {
  const opts = parseArgs();

  if (opts.stage) {
    runStage(opts.stage);
  } else {
    printStatus();
  }
}

main();
