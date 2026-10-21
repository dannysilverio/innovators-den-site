import { useId, useState } from "react";
import StoryVideo from "./StoryVideo";
import { DIRECT_VIDEO_HOSTS, type StoryVideoFields as Fields } from "@workspace/api-zod/story-video";

export default function StoryVideoFields({ value, onChange }: {
  value: Fields;
  onChange: (patch: Fields) => void;
}) {
  const id = useId();
  const [preview, setPreview] = useState(false);
  return <fieldset style={{ border: "1px solid #333", borderRadius: 10, padding: 16, margin: "0 0 16px", color: "#fff" }}>
    <legend style={{ padding: "0 8px", fontWeight: 700 }}>Story video (optional)</legend>
    {([
      ["videoUrl", "Video URL", "url"],
      ["videoPosterUrl", "Poster image URL", "url"],
      ["videoCaption", "Short video caption", "text"],
    ] as const).map(([key, label, type]) => <div key={key} style={{ marginBottom: 12 }}>
      <label htmlFor={`${id}-${key}`} style={{ display: "block", fontSize: 12, marginBottom: 6 }}>{label}</label>
      <input id={`${id}-${key}`} type={type} value={value[key] ?? ""}
        maxLength={key === "videoCaption" ? 300 : 4096}
        onChange={event => onChange({ [key]: event.target.value })}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333", background: "#111", color: "#fff" }}
      />
    </div>)}
    <p style={{ color: "#aaa", fontSize: 12, lineHeight: 1.5 }}>
      Paste a YouTube, Vimeo or share.descript.com link—not embed code.
      Direct MP4/MOV files must use HTTPS on {DIRECT_VIDEO_HOSTS.join(", ")}.
      One portrait video is placed between the story’s opening and closing text.
      Leave Video URL blank to remove the video. Provider players use their own controls and thumbnails; a custom poster is shown before loading.
    </p>
    {value.videoUrl && <button type="button" onClick={() => setPreview(!preview)} style={{ background: "transparent", color: "#FFE600", border: "1px solid #555", borderRadius: 6, padding: 8, marginTop: 12 }}>
      {preview ? "Hide video preview" : "Preview video"}
    </button>}
    {preview && <StoryVideo {...value} />}
  </fieldset>;
}
