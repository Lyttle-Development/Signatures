"use client";

import React, { useState } from "react";

interface CopyBoxProps {
  signatureHtml: string;
  onCopy: () => void;
  disabled?: boolean;
}

export function CopyBox({ signatureHtml, onCopy, disabled = false }: CopyBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled) return;

    // Check if Clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.write) {
      alert("Clipboard API is not supported in this browser. Please use a modern browser with HTTPS.");
      return;
    }

    try {
      // Use the modern Clipboard API to copy HTML
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([signatureHtml], { type: "text/html" }),
          "text/plain": new Blob([""], { type: "text/plain" }),
        }),
      ]);
      
      setCopied(true);
      onCopy();
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy signature. Please try again or ensure you're using HTTPS.");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={handleCopy}
        disabled={disabled}
        className={`w-full px-6 py-3 rounded-md font-semibold text-white transition-colors ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : copied
            ? "bg-green-600 hover:bg-green-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {copied ? "✓ Copied!" : "Copy Signature to Clipboard"}
      </button>
      
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          View HTML Source
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200 max-h-64 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap break-words">
            {signatureHtml}
          </pre>
        </div>
      </details>
    </div>
  );
}
