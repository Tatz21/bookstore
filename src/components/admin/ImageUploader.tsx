"use client";

import React, { useState } from "react";
import { UploadCloud, ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SignatureResponse {
  configured: boolean;
  cloudName: string | null;
  apiKey: string | null;
  timestamp: number | null;
  signature: string | null;
  folder: string;
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    setStatusMsg(null);
    try {
      const sigRes = await fetch("/api/admin/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "book_covers" }),
      });
      const sig = (await sigRes.json()) as SignatureResponse;

      if (sig.configured && sig.cloudName && sig.apiKey && sig.signature) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.apiKey);
        formData.append("timestamp", String(sig.timestamp));
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!uploadRes.ok) {
          throw new Error("Cloudinary upload failed");
        }
        const uploaded = (await uploadRes.json()) as { secure_url: string };
        onChange(uploaded.secure_url);
        setStatusMsg("Uploaded to Cloudinary CDN");
      } else {
        setStatusMsg(
          "Cloudinary env keys are not set — paste an image URL below or configure CLOUDINARY_* in .env."
        );
      }
    } catch (err) {
      setStatusMsg(
        err instanceof Error ? err.message : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
          dragActive
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border-strong)] bg-[var(--surface-subtle)]/70"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
        ) : (
          <UploadCloud className="h-7 w-7 text-[var(--text-muted)]" />
        )}
        <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
          Drag &amp; drop book cover here, or{" "}
          <label className="cursor-pointer font-semibold text-[var(--accent)] underline">
            browse file
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Supports Cloudinary signed WebP/AVIF upload or direct HTTPS cover URL
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Cover Image URL *
          </label>
          <Input
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://covers.openlibrary.org/b/isbn/9780143127741-L.jpg"
            className="mt-1"
          />
          {statusMsg && (
            <p className="mt-1 text-xs text-[var(--accent)]">{statusMsg}</p>
          )}
        </div>

        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--surface-subtle)]">
          {value ? (
            <img
              src={value}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
