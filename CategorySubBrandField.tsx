import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCategoriesQueryKey, useListCategories, updateCategory } from "@workspace/api-client-react";

/** Explicit save: changing a category's branding updates all of its stories. */
export default function CategorySubBrandField({ topic, headers }: { topic: string; headers: Record<string, string> }) {
  const { data, isError } = useListCategories();
  const category = data?.find(item => item.name === topic);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => { setValue(category?.subBrand ?? ""); setMessage(""); }, [category?.slug, category?.subBrand]);
  async function save() {
    if (!category) return;
    if (value.trim().length > 80 || /[\u0000-\u001f\u2014<>]/.test(value)) {
      setMessage("Use a plain-text name up to 80 characters without em dashes.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await updateCategory(category.slug, { subBrand: value.trim() || null }, { headers });
      await queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setMessage("Category sub-brand saved.");
    } catch { setMessage("Could not save the category sub-brand. Your changes have not been saved."); }
    finally { setSaving(false); }
  }
  return <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", color: "#aaa", fontSize: 12, marginBottom: 6 }}>
      Category sub-brand (optional)
      <input value={value} maxLength={80} disabled={!category || saving}
        onChange={event => setValue(event.target.value)}
        style={{ display: "block", width: "100%", marginTop: 6, padding: 10, background: "#111", color: "#fff", border: "1px solid #333", borderRadius: 8 }}
      />
    </label>
    <p style={{ color: "#999", fontSize: 12 }}>Shared by every story in {topic}. Leave blank for no sub-brand.</p>
    <button type="button" onClick={save} disabled={!category || saving}
      style={{ padding: "8px 12px", borderRadius: 6, background: "#FFE600", color: "#000" }}>
      {saving ? "Saving..." : "Save category sub-brand"}
    </button>
    <p role="status" style={{ color: "#aaa", fontSize: 12 }}>{isError ? "Could not load category settings." : !category ? "No category settings available." : message}</p>
  </div>;
}
