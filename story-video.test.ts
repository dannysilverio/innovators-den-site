import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseStoryVideo, splitStoryForVideo, validateStoryVideoFields } from "./story-video";

test("approved providers normalize to fixed, trusted embed players", () => {
  const youtube = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0";
  for (const url of ["https://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtube.com/shorts/dQw4w9WgXcQ"]) {
    assert.equal(parseStoryVideo(url).embedUrl, youtube);
  }
  assert.equal(parseStoryVideo("https://vimeo.com/12345678").embedUrl, "https://player.vimeo.com/video/12345678");
  assert.equal(parseStoryVideo("https://vimeo.com/12345678/abc123").embedUrl, "https://player.vimeo.com/video/12345678?h=abc123");
  assert.equal(parseStoryVideo("https://player.vimeo.com/video/12345678?h=abc123").embedUrl, "https://player.vimeo.com/video/12345678?h=abc123");
  assert.equal(parseStoryVideo("https://share.descript.com/view/hAwUwaSq8E7").embedUrl, "https://share.descript.com/embed/hAwUwaSq8E7");
  assert.equal(parseStoryVideo("https://share.descript.com/embed/hAwUwaSq8E7").provider, "descript");
});

test("trusted MP4/MOV file URLs preserve signed query strings", () => {
  for (const ext of ["mp4", "MOV"]) {
    const url = `https://storage.googleapis.com/my-bucket/reel.${ext}?signed=abc%2B123`;
    assert.equal(parseStoryVideo(url).url, url);
    assert.equal(parseStoryVideo(url).provider, "file");
  }
});

test("rejects arbitrary markup, protocols, lookalike hosts and invalid provider paths", () => {
  for (const url of [
    '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
    "javascript:alert(1)", "data:video/mp4,abc", "http://youtu.be/dQw4w9WgXcQ",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://evil.test/reel.mp4", "https://youtube.com@evil.test/reel.mp4",
    "https://www.youtube.com:444/watch?v=dQw4w9WgXcQ",
    "https://share.descript.com/redirect/abc", "https://vimeo.com/channels/staffpicks",
    "https://storage.googleapis.com/bucket/file.html", "https://youtu.be/not-valid",
    "https://127.0.0.1/reel.mp4", "https://storage.googleapis.com/bucket/reel.mp4\n<script>",
  ]) assert.throws(() => parseStoryVideo(url), undefined, url);
});

test("PATCH omission preserves video; blanks/nulls explicitly remove metadata", () => {
  assert.deepEqual(validateStoryVideoFields({ title: "Unrelated edit" }), {});
  assert.deepEqual(validateStoryVideoFields({ videoUrl: "", videoPosterUrl: null, videoCaption: "  " }),
    { videoUrl: null, videoPosterUrl: null, videoCaption: null });
  assert.deepEqual(validateStoryVideoFields({ videoCaption: "  A reel  " }), { videoCaption: "A reel" });
  assert.throws(() => validateStoryVideoFields({ videoCaption: "x".repeat(301) }));
  assert.throws(() => validateStoryVideoFields({ videoUrl: ["https://youtu.be/dQw4w9WgXcQ"] }));
  assert.throws(() => validateStoryVideoFields({ videoPosterUrl: "javascript:alert(1)" }));
  assert.throws(() => validateStoryVideoFields({ videoPosterUrl: "https://127.0.0.1/image.jpg" }));
});

test("video sits between opening and closing without losing narrative text", () => {
  for (const content of [
    "Opening.\n\n## Second section\n\nMore text.\n\nClosing.",
    "Opening.\n\nMiddle.\n\nClosing.",
    "A single paragraph with opening thoughts and a meaningful closing sentence.",
    "One",
  ]) {
    const [opening, closing] = splitStoryForVideo(content);
    assert.equal(`${opening} ${closing}`.trim().replace(/\s+/g, " "), content.replace(/\s+/g, " "));
    assert.ok(opening.length);
    if (content.includes(" ")) assert.ok(closing.length);
  }
});
