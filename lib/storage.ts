// localStorage utilities for signature data persistence

const STORAGE_KEY = "signature_data";
const STORAGE_KEY_IMAGE = "signature_image";

export interface SignatureData {
  firstName: string;
  lastName: string;
  position: string;
  telephone: string;
  addressLine1: string;
  addressLine2: string;
  psMessage?: string;
}

export function saveSignatureData(data: SignatureData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save signature data:", error);
  }
}

export function loadSignatureData(): SignatureData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load signature data:", error);
  }
  return null;
}

export function clearSignatureData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_IMAGE);
  } catch (error) {
    console.error("Failed to clear signature data:", error);
  }
}

export function saveImageData(imageDataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_IMAGE, imageDataUrl);
  } catch (error) {
    console.error("Failed to save image data:", error);
    // If quota exceeded, try to clear and notify user
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn("localStorage quota exceeded. Image too large to save.");
    }
  }
}

export function loadImageData(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_IMAGE);
  } catch (error) {
    console.error("Failed to load image data:", error);
  }
  return null;
}
