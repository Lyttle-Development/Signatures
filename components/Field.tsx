"use client";

import React from "react";
import { FormOptionType } from "./Form";
import * as Label from "@radix-ui/react-label";

interface FieldProps {
  label: string;
  value?: string;
  required?: boolean;
  type?: FormOptionType;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFile?: (files: FileList) => void;
}

export function Field({
  label,
  value,
  required = false,
  type = FormOptionType.TEXT,
  onChange,
  onFile,
}: FieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="mb-4">
      <Label.Root htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label.Root>
      {type === FormOptionType.FILE ? (
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && onFile) {
              onFile(e.target.files);
            }
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      ) : type === FormOptionType.TEXTAREA ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </div>
  );
}
