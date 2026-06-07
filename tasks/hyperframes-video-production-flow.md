# HyperFrames Video Production Flow

This is the reusable flow for turning a completed script JSON into a HyperFrames project, synced narration, word-level captions, QA screenshots, and a final MP4.

## Inputs

- Script JSON: `data/scripts/*.json`
- Reference tone: `mychannel/video/survivorship-v2`
- Queue order: `tasks/video-production-queue.md`

## One-Command Flow

From the repo root:

```bash
npm run video:from-script -- data/scripts/1779800000002_depression-is-a-prediction-error.json
```

Useful flags:

```bash
npm run video:from-script -- data/scripts/example.json --skip-render
npm run video:from-script -- data/scripts/example.json --force-audio --force-transcript
```

## Existing Project Flow

If the HyperFrames project already exists:

```bash
npm run video:produce -- mychannel/video/depression-is-a-prediction-error-v1
cd mychannel/video/depression-is-a-prediction-error-v1
npm run check
npm run render
```

## What The Scripts Do

1. `scripts/create-video-projects.js`
   - Creates `mychannel/video/<slug>-v1`
   - Writes `index.html`, `assets/segments.json`, narration text files, metadata, and package scripts

2. `scripts/produce-video-project.js`
   - Generates Kokoro `am_adam` WAV narration from `assets/narration/*.txt`
   - Transcribes each WAV with Whisper `small.en`
   - Rebuilds `index.html` with actual durations, audio tags, word-level karaoke captions, and segment-specific motifs

3. `scripts/qa-video-screenshots.js`
   - Seeks the HyperFrames timeline at representative timestamps
   - Writes screenshots and `renders/qa/contact-sheet.jpg`

4. `npm run check`
   - Runs HyperFrames lint and validate
   - Current long-form projects intentionally omit `inspect` because the long multi-audio page hits HyperFrames' fixed navigation timeout; screenshot QA covers layout inspection

5. `npm run render`
   - Uses `scripts/render-video-playwright.js`
   - Renders by seeking the same HyperFrames timeline with Playwright and encoding via ffmpeg
   - Writes `renders/<project-id>-full.mp4`

## Outputs

Each completed project should contain:

- `renders/<project-id>-full.mp4`
- `renders/qa/contact-sheet.jpg`
- `renders/final-qa/contact-sheet.jpg` when final MP4 QA frames are extracted
- `transcript.json`
- Updated `production-notes.md`

## Completion Criteria

- `npm run check` exits 0
- QA contact sheet shows nonblank frames with no obvious text overlap
- Final MP4 has both video and audio streams
- `production-notes.md` lists outputs and any render caveats
- `tasks/video-production-queue.md` status is updated
