#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function usage() {
  console.error(`Usage:
  node scripts/produce-video-project.js <project-dir> [--force-audio] [--force-transcript] [--skip-audio] [--skip-transcript] [--skip-build]

Example:
  node scripts/produce-video-project.js channels/autopilot/video/your-brain-decides-before-you-do-v1`);
  process.exit(1);
}

const args = process.argv.slice(2);
const projectArg = args.find((arg) => !arg.startsWith('--'));
if (!projectArg) usage();

const projectDir = path.resolve(ROOT, projectArg);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));

function run(command, commandArgs, options = {}) {
  console.log(`\n> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      HF_HUB_DISABLE_SYMLINKS_WARNING: '1',
      ...options.env,
    },
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (!flags.has('--skip-audio')) {
  const audioArgs = [
    'run',
    '--python', '3.12',
    '--with', 'kokoro==0.7.16',
    '--with', 'soundfile',
    '--',
    'python',
    path.join('scripts', 'generate-kokoro-narration.py'),
    projectDir,
  ];
  if (flags.has('--force-audio')) audioArgs.push('--force');
  run('uv', audioArgs);
}

if (!flags.has('--skip-transcript')) {
  const transcriptArgs = [
    path.join('scripts', 'transcribe-word-timings.py'),
    projectDir,
  ];
  if (flags.has('--force-transcript')) transcriptArgs.push('--force');
  run('python', transcriptArgs);
}

if (!flags.has('--skip-build')) {
  run('node', [path.join('scripts', 'build-wordlevel-video.js'), projectDir]);
}

console.log('\nProduction prep complete.');
