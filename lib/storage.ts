// localStorage utilities for signature data persistence

const STORAGE_KEY = "signature_data";

export interface SignatureData {
  firstName: string;
  lastName: string;
  position: string;
  telephone: string;
  addressLine1: string;
  addressLine2: string;
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
  } catch (error) {
    console.error("Failed to clear signature data:", error);
  }
}
