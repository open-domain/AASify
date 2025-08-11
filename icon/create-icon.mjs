import fs from 'fs';

// Create a simple 16x16 PNG icon for AASify files
const width = 16;
const height = 16;

// Simple icon data representing AAS structure (hexagonal pattern)
const iconData = [
  // Row 0-2: top padding
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
  
  // Row 3-5: top part of hexagon
  0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,
  0,0,0,1,2,3,3,3,3,3,3,2,1,0,0,0,
  0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0,
  
  // Row 6-9: middle part with inner elements
  0,1,2,3,3,4,4,5,5,4,4,3,3,2,1,0,
  0,1,2,3,4,4,5,5,5,5,4,4,3,2,1,0,
  0,1,2,3,4,4,5,5,5,5,4,4,3,2,1,0,
  0,1,2,3,3,4,4,5,5,4,4,3,3,2,1,0,
  
  // Row 10-12: bottom part
  0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0,
  0,0,0,1,2,3,3,3,3,3,3,2,1,0,0,0,
  0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,
  
  // Row 13-15: bottom padding
  0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

// Color palette (RGB values)
const colors = [
  [0, 0, 0, 0],           // 0: transparent
  [74, 144, 226, 255],    // 1: dark blue
  [107, 169, 235, 255],   // 2: medium blue  
  [135, 206, 235, 255],   // 3: light blue
  [200, 230, 255, 255],   // 4: very light blue
  [255, 255, 255, 255]    // 5: white
];

// Convert to RGBA data
const rgbaData = [];
for (let i = 0; i < iconData.length; i++) {
  const colorIndex = iconData[i];
  const color = colors[colorIndex];
  rgbaData.push(...color);
}

// Create a 32-bit BMP file
const createBMP = () => {
  const pixelDataSize = width * height * 4;
  const fileSize = 54 + pixelDataSize;
  
  const header = Buffer.alloc(54);
  
  // BMP signature
  header.write('BM', 0);
  
  // File size
  header.writeUInt32LE(fileSize, 2);
  
  // Reserved fields
  header.writeUInt32LE(0, 6);
  
  // Pixel data offset
  header.writeUInt32LE(54, 10);
  
  // DIB header size
  header.writeUInt32LE(40, 14);
  
  // Image dimensions
  header.writeInt32LE(width, 18);
  header.writeInt32LE(-height, 22); // Negative for top-down
  
  // Color planes
  header.writeUInt16LE(1, 26);
  
  // Bits per pixel
  header.writeUInt16LE(32, 28);
  
  // Compression (0 = none)
  header.writeUInt32LE(0, 30);
  
  // Image size
  header.writeUInt32LE(pixelDataSize, 34);
  
  // Resolution (72 DPI)
  header.writeUInt32LE(2835, 38); // X pixels per meter
  header.writeUInt32LE(2835, 42); // Y pixels per meter
  
  // Colors used and important colors
  header.writeUInt32LE(0, 46);
  header.writeUInt32LE(0, 50);
  
  const pixelData = Buffer.from(rgbaData);
  
  return Buffer.concat([header, pixelData]);
};

// Write the icon file
const bmpData = createBMP();
fs.writeFileSync('aasify.bmp', bmpData);

console.log('Created aasify.bmp icon file successfully');
console.log(`Icon size: ${width}x${height} pixels`);
