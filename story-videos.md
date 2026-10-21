# Story videos — development implementation

This feature has not been published. No production schema/data or domain
configuration was changed. Native bundle exports are local verification
outputs, not App Store/Play Store releases.

## Attach or remove a video

In the web development app, open **Admin → Publish Story**. On a new story,
or after choosing **Edit** on an existing Den story, use **Story video
(optional)**:

1. Paste the hosted video link into **Video URL**.
2. Optionally enter a public HTTPS **Poster image URL**.
3. Optionally enter a **Short video caption**, up to 300 characters.
4. Use **Preview video**, then save the story.

The existing “Publish Now” button creates an approved article in the database
of the app you are currently using; it does not publish the Replit project.
For this development-only work, use the development app, not the live site.

Clear **Video URL** and save to remove the player. Blank strings are converted
to null; omitting a video field from an API PATCH preserves its previous value.
The poster and caption can be independently cleared.

No actual videos were supplied for the two intended stories, so none were
attached to the original stories. This feature accepts hosted URLs, not uploads.

## Supported links

- YouTube: watch, youtu.be share, Shorts, live and embed URLs.
- Vimeo: public video/player URLs and unlisted URLs with a privacy hash.
- Descript: `https://share.descript.com/view/VIDEO_ID` or its embed URL.
- Direct HTTPS `.mp4` / `.mov` paths on the exact approved hosts:
  - `storage.googleapis.com`
  - `commondatastorage.googleapis.com`
  - `res.cloudinary.com`

Signed query parameters on direct-file links are preserved. Do not use a
short-lived signed URL for a permanently published story; use a durable public
delivery URL or implement server-side URL refresh separately.

Additional direct-file CDN hosts must be explicitly reviewed and added to
`DIRECT_VIDEO_HOSTS` in `lib/api-zod/src/story-video.ts`. Do not enable arbitrary
hosts, raw iframe markup, HTTP, credentials in URLs or nonstandard ports.
The server and both clients use the same policy.

An MP4/MOV extension is not a codec guarantee. H.264/AAC MP4 is the safest
cross-platform delivery choice; MOV support depends on the device/browser.
The player does not transcode files. Provider videos must be shared in a way
that permits embedding; privacy/domain restrictions still apply.

## Rendering

One optional video is inserted between the opening section and the remaining
story text. Existing no-video render paths are unchanged. The dedicated Sword
story page also reads the record's video fields and retains its route.

Players use a centered 9:16 frame, bounded desktop width and contain-fit media,
not stretching or cropping. Direct video uses HTML video on web and expo-video
on mobile. Provider URLs become fixed allowlisted iframe/WebView URLs.
Optional posters are used on direct players; for provider players a custom
poster is a tap-to-load cover, while the embedded provider controls its own
thumbnail and controls after loading.

Playback is user-initiated. Standard controls/fullscreen are enabled, and a
failure message plus an external-video link leaves the complete story readable.
Cross-origin provider failures cannot all be detected by the parent page, so
the separate-video fallback is always visible.

## API and database

Nullable columns: `articles.video_url`, `video_poster_url`, `video_caption`.
API fields: `videoUrl`, `videoPosterUrl`, `videoCaption`.

`POST /api/articles`, `PATCH /api/articles/:id`, list and detail endpoints
support the fields. Invalid video input returns HTTP 400 before writing.
OpenAPI/generated client schemas include the fields and article-update route.

Only these three nullable columns were added to the development database.
The general Drizzle push encountered unrelated schema drift and was stopped
without accepting any rename/create/drop prompt. Production remains unchanged;
no startup DDL or deployment migration hook was added.

The guarded ten-original content import and full-body readers remain intact.
The importer does not write video fields or overwrite completed imports.

## Verification and limits

- Shared library type checks, web/API builds and local iOS/Android bundle
  exports passed.
- Ten unit tests passed, including existing import safety/idempotence tests.
- Development API create, all four link types, reload, unrelated edit,
  invalid links, caption validation and clearing fields were checked.
- Browser verification confirmed reading order and graceful fallback on web
  and mobile web. The test Chromium build cannot decode H.264: it returned
  MEDIA_ERR_SRC_NOT_SUPPORTED for both the app and an independent bare player,
  despite a successful HTTP 206 media response.
- Actual H.264 playback on a supported physical device/browser has not been
  verified. The authenticated admin UI was not browser-verified because no
  documented development test access code was available.
- Existing unrelated whole-app type errors and Expo version warnings remain
  outside this feature.
