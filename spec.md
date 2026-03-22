# Lehmberg Knowledge Wiki

## Current State

The wiki renders rich text in `BodyRenderer.tsx` using dangerouslySetInnerHTML. Links and formatted content display correctly. There is no special handling for YouTube URLs.

## Requested Changes (Diff)

### Add
- YouTube URL detection and embed rendering in `BodyRenderer.tsx`: when rendered HTML contains a plain anchor tag whose href is a YouTube URL (youtube.com/watch?v=... or youtu.be/...), replace it with an inline iframe embed of the video.

### Modify
- `BodyRenderer.tsx`: post-process rendered HTML to detect YouTube links and render them as responsive embeds.

### Remove
- Nothing removed.

## Implementation Plan

1. In `BodyRenderer.tsx`, add a utility function `embedYouTube(html: string): string` that:
   - Matches anchor tags where href is a YouTube URL (both `youtube.com/watch?v=ID` and `youtu.be/ID` variants)
   - Extracts the video ID
   - Replaces the anchor with a responsive iframe embed using `https://www.youtube.com/embed/ID`
2. Apply this transformation after `addTargetBlank` before rendering.
