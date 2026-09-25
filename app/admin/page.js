"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

const CATEGORIES = [
  { id: "skit", label: "Short-form skits" },
  { id: "ugc", label: "UGC content" },
  { id: "product", label: "Product showcases" },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState(null); // { type: 'ok'|'error', text }
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (unlocked) loadVideos();
  }, [unlocked]);

  async function loadVideos() {
    const res = await fetch("/api/videos", { cache: "no-store" });
    const data = await res.json();
    setVideos(data.videos || []);
  }

  function handleUnlock(e) {
    e.preventDefault();
    if (password.trim().length > 0) setUnlocked(true);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setStatus({ type: "error", text: "Choose a video file first." });
      return;
    }
    setUploading(true);
    setStatus(null);

    try {
      // Uploads the (potentially large) file straight from the browser to
      // Blob storage, bypassing the server so we never hit the 4.5MB
      // serverless function body limit.
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ password, category, label }),
      });

      // Now save the small bit of metadata (url/category/label).
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blob.url, category, label, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save video info.");

      setStatus({ type: "ok", text: "Video added." });
      setFile(null);
      setLabel("");
      e.target.reset();
      loadVideos();
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    const res = await fetch("/api/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) loadVideos();
  }

  if (!unlocked) {
    return (
      <div className="admin-wrap">
        <h1>Admin login</h1>
        <form onSubmit={handleUnlock}>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button className="btn" type="submit">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <h1>Add a video</h1>
      <form onSubmit={handleUpload}>
        <div className="field">
          <label>Video file</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Skincare GRWM"
          />
        </div>
        <button className="btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload video"}
        </button>
        {status && (
          <p className={`msg ${status.type === "error" ? "error" : "ok"}`}>
            {status.text}
          </p>
        )}
      </form>

      <div className="admin-list">
        <h1 style={{ fontSize: "1.2rem" }}>Current videos ({videos.length})</h1>
        {videos.map((v) => (
          <div className="admin-row" key={v.id}>
            <span>
              {v.label || "Untitled"} — {v.category}
            </span>
            <button className="del" onClick={() => handleDelete(v.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
