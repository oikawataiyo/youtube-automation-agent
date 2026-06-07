---
description: Produce a HyperFrames video package and MP4 from a script JSON or existing project directory.
argument-hint: <data/scripts/file.json | mychannel/video/project-v1> [--skip-render] [--force-audio] [--force-transcript]
---

You are producing a completed HyperFrames video using the repo's reusable video production flow.

Reference docs:
- `tasks/hyperframes-video-production-flow.md`
- `tasks/video-production-queue.md`

User argument:

```text
$ARGUMENTS
```

Follow this procedure:

1. If `$ARGUMENTS` is empty, open `tasks/video-production-queue.md` and choose the first project whose status is not completed.
2. If the first argument is a `data/scripts/*.json` path, run:

   ```bash
   npm run video:from-script -- $ARGUMENTS
   ```

3. If the first argument is a `mychannel/video/*` project directory, run:

   ```bash
   npm run video:produce -- $ARGUMENTS
   cd <project-dir>
   npm run check
   npm run render
   ```

4. After render, verify the MP4 with `ffprobe` and extract several final QA frames if they are not already present.
5. Update the project's `production-notes.md` with final outputs and caveats.
6. Update `tasks/video-production-queue.md` status.
7. Report the final MP4 path, QA path, and any warnings that remain.

Important:
- Do not skip `npm run check`.
- Do not use the original HyperFrames render if it stalls; `npm run render` is wired to the Playwright+ffmpeg fallback renderer for these long-form projects.
- Keep the visual register aligned with `mychannel/video/survivorship-v2`: dark editorial, sparse diagrams, kinetic emphasis, word-level captions.
