// Image processing utilities for signatures

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function processImageWithCircularMask(
  dataUrl: string,
  size: number = 121,
  applyGrayscale: boolean = true,
  grayscaleAmount: number = 100
): Promise<string> {
  const imgElement = await loadImage(dataUrl);
  
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.clearRect(0, 0, size, size);

  // Create a circular clipping mask
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Apply grayscale filter if needed
  if (applyGrayscale) {
    ctx.filter = `grayscale(${grayscaleAmount}%)`;
  }

  // Calculate scale for "object-fit: cover"
  const scale = Math.max(size / imgElement.width, size / imgElement.height);
  const newWidth = imgElement.width * scale;
  const newHeight = imgElement.height * scale;
  const offsetX = (size - newWidth) / 2;
  const offsetY = (size - newHeight) / 2;

  // Draw the image within the circular area
  ctx.drawImage(imgElement, offsetX, offsetY, newWidth, newHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  });
}

export async function combineImagesWithGradient(
  gradientUrl: string,
  profileUrl: string,
  removeBackground: boolean = false,
  brightnessThreshold: number = 200
): Promise<string> {
  const [gradientImg, profileImg] = await Promise.all([
    loadImage(gradientUrl),
    loadImage(profileUrl),
  ]);

  const canvasWidth = 160;
  const canvasHeight = 175;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Draw the gradient image (positioned at the bottom-left)
  ctx.drawImage(gradientImg, 0, canvasHeight - 175, 139, 175);

  // Prepare the profile image to mimic object-fit: cover
  const targetWidth = 142;
  const targetHeight = 148;
  const profileCanvas = document.createElement("canvas");
  profileCanvas.width = targetWidth;
  profileCanvas.height = targetHeight;
  const pCtx = profileCanvas.getContext("2d");
  
  if (!pCtx) {
    throw new Error("Could not get profile canvas context");
  }

  // Calculate scaling for "cover"
  const scale = Math.max(
    targetWidth / profileImg.width,
    targetHeight / profileImg.height
  );
  const newWidth = profileImg.width * scale;
  const newHeight = profileImg.height * scale;
  const offsetX = (targetWidth - newWidth) / 2;
  const offsetY = (targetHeight - newHeight) / 2;

  pCtx.drawImage(profileImg, offsetX, offsetY, newWidth, newHeight);
  
  if (removeBackground) {
    // Simple background removal using brightness threshold
    // This is a basic implementation - for production, consider using an API like remove.bg
    const imageData = pCtx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    // Threshold-based background removal with configurable brightness
    // Also check for color similarity to improve detection
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      
      // Check if pixel is close to white/light or if colors are very similar (gray-ish background)
      const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
      
      // If pixel is bright AND colors are similar (not much variation), it's likely background
      if (brightness > brightnessThreshold || (brightness > 180 && colorDiff < 30)) {
        // Fade out based on how close to white it is
        const alpha = Math.max(0, (brightnessThreshold - brightness) / brightnessThreshold * 255);
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }
    
    pCtx.putImageData(imageData, 0, 0);
  }

  // Draw the processed profile image onto the final canvas
  ctx.drawImage(
    profileCanvas,
    13,
    canvasHeight - targetHeight,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  });
}
