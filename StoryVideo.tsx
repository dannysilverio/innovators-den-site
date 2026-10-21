import { useEffect, useRef, useState } from "react";
import { parseStoryVideo, type StoryVideoFields, type StoryVideoSource } from "@workspace/api-zod/story-video";

function Player({ source, videoPosterUrl, videoCaption }: StoryVideoFields & { source: StoryVideoSource }) {
  const [failed, setFailed] = useState(false);
  const [activated, setActivated] = useState(!videoPosterUrl || source.provider === "file");
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!source.embedUrl || event.source !== frame.current?.contentWindow || event.origin !== new URL(source.embedUrl).origin) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "error" || data?.event === "onError") setFailed(true);
      } catch { /* Ignore non-player messages. */ }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [source.embedUrl]);
  return <figure aria-label="Story video" style={{ margin: "32px auto", width: "min(100%, 360px, 45vh)" }}>
    <div style={{ aspectRatio: "9 / 16", background: "#000", position: "relative", overflow: "hidden", borderRadius: 12, color: "#fff" }}>
      {failed ? <div role="alert" style={{ padding: 24, height: "100%", display: "grid", alignContent: "center", textAlign: "center" }}>
        This video could not be played here. You can still read the complete story and open the video below.
      </div> : source.provider === "file" ? <video
        src={source.url} poster={videoPosterUrl ?? undefined}
        controls playsInline preload="metadata" onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        aria-label={videoCaption || "Story video"}
      /> : !activated ? <button
        type="button" aria-label="Load story video" onClick={() => setActivated(true)}
        style={{ width: "100%", height: "100%", position: "relative", border: 0, padding: 0, background: "transparent", color: "#fff", cursor: "pointer" }}
      >
        <img src={videoPosterUrl!} alt="" onError={event => { event.currentTarget.style.visibility = "hidden"; }} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <span style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textShadow: "0 2px 5px #000" }}>Play video</span>
      </button> : <iframe
        ref={frame} src={source.embedUrl} title={videoCaption || "Story video"}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", border: 0 }}
      />}
    </div>
    {videoCaption && <figcaption style={{ fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>{videoCaption}</figcaption>}
    <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.75, marginTop: 8 }}>
      Trouble playing? <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>Open the video in a new tab</a>.
    </p>
  </figure>;
}

export default function StoryVideo(props: StoryVideoFields) {
  if (!props.videoUrl) return null;
  try {
    const source = parseStoryVideo(props.videoUrl);
    return <Player key={props.videoUrl} {...props} source={source} />;
  } catch {
    return <p role="alert">This story’s video link is unavailable. The complete story remains below.</p>;
  }
}
