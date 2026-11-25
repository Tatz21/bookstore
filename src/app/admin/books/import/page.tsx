"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Download, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

const SAMPLE_CSV = `title,author,isbn13,description,category,price,discountPrice,stockQuantity,weightGrams,format,language,pages,publisher,coverImageUrl,isFeatured
The Staff Engineer's Path,Tanya Reilly,9781098118730,A guide for individual contributors navigating technical leadership.,Technology & Design,1299,999,14,480,PAPERBACK,English,336,O'Reilly Media,https://covers.openlibrary.org/b/isbn/9781098118730-L.jpg,false
Meditations,Marcus Aurelius,9780812968255,Timeless Stoic reflections on duty and inner clarity.,Philosophy & Craft,499,,22,300,PAPERBACK,English,256,Modern Library,https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg,false`;

export default function BulkImportPage() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    importedCount: number;
    errorCount: number;
    created: string[];
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folio-spine-book-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/books/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
            Bulk CSV Catalog Import
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Upload multiple books at once using our standardized CSV schema.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4" /> Download Template
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel space-y-4 rounded-3xl p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-subtle)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
            <span>Load a .csv file or paste CSV rows below:</span>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="text-xs text-[var(--text-secondary)]"
          />
        </div>

        <Textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="min-h-[220px] font-mono text-xs"
        />

        <div className="flex justify-end gap-3">
          <Link href="/admin/books">
            <Button type="button" variant="outline">
              Back to Inventory
            </Button>
          </Link>
          <Button type="submit" variant="accent" disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Importing..." : "Run Bulk Import"}
          </Button>
        </div>
      </form>

      {result && (
        <div className="glass-panel space-y-3 rounded-3xl p-6">
          <div className="flex items-center gap-2 font-semibold text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
            Imported {result.importedCount} book(s) ({result.errorCount}{" "}
            error(s))
          </div>
          {result.created?.length > 0 && (
            <p className="text-xs text-[var(--text-secondary)]">
              Created: {result.created.join(", ")}
            </p>
          )}
          {result.errors?.length > 0 && (
            <ul className="space-y-1 text-xs text-red-500">
              {result.errors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
