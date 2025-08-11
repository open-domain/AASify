// Create a simple PNG icon using Node.js built-in libraries
const fs = require('fs');

// Create a simple 32x32 PNG icon with AASify branding
// This is a minimal PNG that represents the AASify language
const createSimplePNG = () => {
  // PNG header for a 32x32 RGBA image
  const width = 32;
  const height = 32;
  
  // Create image data (simple blue gradient with white center)
  const imageData = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const ratio = distance / maxDistance;
      
      if (distance < 6) {
        // Center circle - white
        imageData.push(255, 255, 255, 255); // RGBA
      } else if (distance < 12) {
        // Inner ring - light blue
        imageData.push(135, 206, 235, 255);
      } else {
        // Outer area - dark blue
        const blue = Math.max(50, 200 - ratio * 150);
        imageData.push(74, 144, blue, 255);
      }
    }
  }
  
  // Create a simple BMP instead (easier format)
  const bmpHeader = Buffer.alloc(54);
  const pixelDataSize = width * height * 4;
  const fileSize = 54 + pixelDataSize;
  
  // BMP file header
  bmpHeader.write('BM', 0); // Signature
  bmpHeader.writeUInt32LE(fileSize, 2); // File size
  bmpHeader.writeUInt32LE(54, 10); // Pixel data offset
  
  // DIB header
  bmpHeader.writeUInt32LE(40, 14); // DIB header size
  bmpHeader.writeInt32LE(width, 18); // Image width
  bmpHeader.writeInt32LE(-height, 22); // Image height (negative for top-down)
  bmpHeader.writeUInt16LE(1, 26); // Color planes
  bmpHeader.writeUInt16LE(32, 28); // Bits per pixel
  bmpHeader.writeUInt32LE(0, 30); // Compression
  bmpHeader.writeUInt32LE(pixelDataSize, 34); // Image size
  
  const pixelData = Buffer.from(imageData);
  
  return Buffer.concat([bmpHeader, pixelData]);
};

// Write the BMP file
const bmpData = createSimplePNG();
fs.writeFileSync('aasify-file-icon.bmp', bmpData);

console.log('Created aasify-file-icon.bmp successfully');
