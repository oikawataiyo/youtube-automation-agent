#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function usage() {
  console.error(`Usage:
  node scripts/produce-from-script.js <script-json> [--force-audio] [--force-transcript] [--skip-render] [--skip-thumb]

Examples:
  node scripts/produce-from-script.js data/scripts/1779800000001_your-brain-decides-before-you-do.json
  node scripts/produce-from-script.js data/scripts/1779800000002_depression-is-a-prediction-error.json --skip-render`);
  process.exit(1);
}

const args = process.argv.slice(2);
const scriptArg = args.find((arg) => !arg.startsWith('--'));
if (!scriptArg) usage();

const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const scriptPath = path.resolve(ROOT, scriptArg);
if (!fs.existsSync(scriptPath)) {
  console.error(`Script JSON not found: ${scriptPath}`);
  process.exit(1);
}

function slugFromScriptFile(fileName) {
  return path.basename(fileName, '.json').replace(/^\d+_/, '');
}

function projectDirFromScript(scriptPath) {
  return path.join(ROOT, 'channels', 'autopilot', 'video', `${slugFromScriptFile(path.basename(scriptPath))}-v1`);
}

function run(command, commandArgs, options = {}) {
  console.log(`\n> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      HF_HUB_DISABLE_SYMLINKS_WARNING: '1',
    },
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

const projectDir = projectDirFromScript(scriptPath);

run('node', [path.join('scripts', 'create-video-projects.js'), scriptPath]);

const produceArgs = [path.join('scripts', 'produce-video-project.js'), projectDir];
if (flags.has('--force-audio')) produceArgs.push('--force-audio');
if (flags.has('--force-transcript')) produceArgs.push('--force-transcript');
run('node', produceArgs);

run('npm', ['run', 'check'], { cwd: projectDir });
run('node', [path.join('scripts', 'qa-video-screenshots.js'), projectDir]);

if (!flags.has('--skip-render')) {
  run('npm', ['run', 'render'], { cwd: projectDir });
}

if (!flags.has('--skip-thumb')) {
  run('node', [path.join('scripts', 'build-thumbnail.js'), projectDir]);
}

const finalMp4 = path.join(projectDir, 'renders', `${path.basename(projectDir)}-full.mp4`);
console.log('\nDone.');
console.log(`Project: ${projectDir}`);
if (fs.existsSync(finalMp4)) console.log(`MP4: ${finalMp4}`);
