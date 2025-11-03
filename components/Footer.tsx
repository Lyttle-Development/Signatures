"use client";

export function Footer() {
  return (
    <footer className="bg-[#100429] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Lyttle Development. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://www.lyttledevelopment.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Website
            </a>
            <a
              href="https://www.lyttledevelopment.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
