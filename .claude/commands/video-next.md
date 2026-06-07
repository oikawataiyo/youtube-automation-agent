---
description: Continue the video production queue with the next unfinished project.
argument-hint: [--skip-render] [--force-audio] [--force-transcript]
---

Continue the production queue from `tasks/video-production-queue.md`.

Extra flags from the user:

```text
$ARGUMENTS
```

Procedure:

1. Read `tasks/video-production-queue.md`.
2. Select the first row whose status is not completed.
3. Use its `Source Script` path.
4. Run:

   ```bash
   npm run video:from-script -- <source-script> $ARGUMENTS
   ```

5. Verify:
   - `npm run check` completed successfully
   - final MP4 exists and has video/audio streams via `ffprobe`
   - QA contact sheet exists
6. Update `production-notes.md` and `tasks/video-production-queue.md`.
7. Report final MP4 path and QA path.
