"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[#100429] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            Signatures
          </Link>
          <div className="flex gap-6">
            <Link
              href="/lyttledevelopment"
              className="hover:text-gray-300 transition-colors"
            >
              Lyttle Development
            </Link>
            <Link
              href="/arcelormittal"
              className="hover:text-gray-300 transition-colors"
            >
              ArcelorMittal
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
