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
  applyGrayscale: boolean = true
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
    ctx.filter = "grayscale(100%)";
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
  removeBackground: boolean = false
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

  if (removeBackground) {
    // Simple background removal using edge detection
    // This is a basic implementation - for production, consider using an API
    pCtx.drawImage(profileImg, offsetX, offsetY, newWidth, newHeight);
    const imageData = pCtx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    // Simple threshold-based background removal
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is close to white or very light, make it transparent
      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    pCtx.putImageData(imageData, 0, 0);
  } else {
    pCtx.drawImage(profileImg, offsetX, offsetY, newWidth, newHeight);
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
