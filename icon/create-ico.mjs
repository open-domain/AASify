import fs from 'fs';

// Create a simple PNG icon - we'll create the binary PNG data directly
function createPNG() {
    const width = 16;
    const height = 16;
    
    // Create RGBA pixel data
    const pixels = [];
    
    // Define a simple hexagonal pattern for AASify
    const pattern = [
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
        [0,0,0,1,2,3,3,3,3,3,3,2,1,0,0,0],
        [0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0],
        [0,1,2,3,3,4,4,5,5,4,4,3,3,2,1,0],
        [0,1,2,3,4,4,5,5,5,5,4,4,3,2,1,0],
        [1,2,3,3,4,5,5,6,6,5,5,4,3,3,2,1],
        [1,2,3,4,4,5,6,6,6,6,5,4,4,3,2,1],
        [1,2,3,4,4,5,6,6,6,6,5,4,4,3,2,1],
        [1,2,3,3,4,5,5,6,6,5,5,4,3,3,2,1],
        [0,1,2,3,4,4,5,5,5,5,4,4,3,2,1,0],
        [0,1,2,3,3,4,4,5,5,4,4,3,3,2,1,0],
        [0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0],
        [0,0,0,1,2,3,3,3,3,3,3,2,1,0,0,0],
        [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0]
    ];
    
    // Color palette for AASify (blue theme)
    const colors = [
        [0, 0, 0, 0],           // 0: transparent
        [41, 98, 176, 255],     // 1: dark blue border
        [74, 144, 226, 255],    // 2: medium blue
        [107, 169, 235, 255],   // 3: lighter blue
        [135, 206, 235, 255],   // 4: light blue
        [200, 230, 255, 255],   // 5: very light blue
        [255, 255, 255, 255]    // 6: white center
    ];
    
    // Convert pattern to RGBA data
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const colorIndex = pattern[y][x];
            const [r, g, b, a] = colors[colorIndex];
            pixels.push(r, g, b, a);
        }
    }
    
    // PNG file structure
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);      // Width
    ihdrData.writeUInt32BE(height, 4);     // Height
    ihdrData.writeUInt8(8, 8);             // Bit depth
    ihdrData.writeUInt8(6, 9);             // Color type (RGBA)
    ihdrData.writeUInt8(0, 10);            // Compression
    ihdrData.writeUInt8(0, 11);            // Filter
    ihdrData.writeUInt8(0, 12);            // Interlace
    
    const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdrChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 13]),        // Length
        Buffer.from('IHDR'),               // Type
        ihdrData,                          // Data
        Buffer.from([ihdrCrc >>> 24, (ihdrCrc >>> 16) & 0xFF, (ihdrCrc >>> 8) & 0xFF, ihdrCrc & 0xFF])
    ]);
    
    // IDAT chunk (image data)
    const pixelBuffer = Buffer.from(pixels);
    const idatData = deflate(pixelBuffer);
    const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), idatData]));
    const idatChunk = Buffer.concat([
        Buffer.from([(idatData.length >>> 24) & 0xFF, (idatData.length >>> 16) & 0xFF, (idatData.length >>> 8) & 0xFF, idatData.length & 0xFF]),
        Buffer.from('IDAT'),
        idatData,
        Buffer.from([idatCrc >>> 24, (idatCrc >>> 16) & 0xFF, (idatCrc >>> 8) & 0xFF, idatCrc & 0xFF])
    ]);
    
    // IEND chunk
    const iendCrc = crc32(Buffer.from('IEND'));
    const iendChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 0]),         // Length
        Buffer.from('IEND'),               // Type
        Buffer.from([iendCrc >>> 24, (iendCrc >>> 16) & 0xFF, (idatCrc >>> 8) & 0xFF, iendCrc & 0xFF])
    ]);
    
    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 implementation
function crc32(buffer) {
    const crcTable = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        crcTable[i] = c;
    }
    
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Simple deflate (just store uncompressed for simplicity)
function deflate(data) {
    // Add scanline filter bytes (0 = no filter)
    const filtered = [];
    const width = 16;
    const bytesPerPixel = 4;
    const scanlineLength = width * bytesPerPixel;
    
    for (let y = 0; y < 16; y++) {
        filtered.push(0); // Filter type
        for (let x = 0; x < scanlineLength; x++) {
            filtered.push(data[y * scanlineLength + x]);
        }
    }
    
    // Simple uncompressed deflate block
    const filteredBuffer = Buffer.from(filtered);
    const result = Buffer.alloc(filteredBuffer.length + 6);
    
    result[0] = 0x78; // zlib header
    result[1] = 0x01; // zlib header
    result[2] = 0x01; // final block, uncompressed
    result.writeUInt16LE(filteredBuffer.length, 3);
    result.writeUInt16LE(~filteredBuffer.length, 5);
    filteredBuffer.copy(result, 7);
    
    return result;
}

// Create a simplified ICO file instead (easier and more compatible)
function createICO() {
    const width = 16;
    const height = 16;
    
    // Create RGBA pixel data
    const pixels = [];
    
    // Define a simple hexagonal pattern for AASify
    const pattern = [
        "0000001111000000",
        "0001122221100000", 
        "0012333333210000",
        "0123344443321000",
        "1233455544332100",
        "1234455554432100",
        "2334566665544321",
        "2344566665544321",
        "2344566665544321", 
        "2334566665544321",
        "1234455554432100",
        "1233455544332100",
        "0123344443321000",
        "0012333333210000",
        "0001122221100000",
        "0000001111000000"
    ];
    
    // Color palette for AASify (blue theme)
    const colors = [
        [0, 0, 0, 0],           // 0: transparent
        [41, 98, 176, 255],     // 1: dark blue border
        [74, 144, 226, 255],    // 2: medium blue
        [107, 169, 235, 255],   // 3: lighter blue
        [135, 206, 235, 255],   // 4: light blue
        [200, 230, 255, 255],   // 5: very light blue
        [255, 255, 255, 255]    // 6: white center
    ];
    
    // Convert pattern to BGRA data (ICO format uses BGRA)
    for (let y = height - 1; y >= 0; y--) { // ICO is bottom-up
        for (let x = 0; x < width; x++) {
            const colorIndex = parseInt(pattern[y][x]);
            const [r, g, b, a] = colors[colorIndex];
            pixels.push(b, g, r, a); // BGRA order
        }
    }
    
    const pixelData = Buffer.from(pixels);
    
    // ICO header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);     // Reserved
    header.writeUInt16LE(1, 2);     // Type (1 = ICO)
    header.writeUInt16LE(1, 4);     // Number of images
    
    // Directory entry
    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(width, 0);      // Width
    dirEntry.writeUInt8(height, 1);     // Height
    dirEntry.writeUInt8(0, 2);          // Color palette
    dirEntry.writeUInt8(0, 3);          // Reserved
    dirEntry.writeUInt16LE(1, 4);       // Color planes
    dirEntry.writeUInt16LE(32, 6);      // Bits per pixel
    dirEntry.writeUInt32LE(40 + pixelData.length, 8); // Size
    dirEntry.writeUInt32LE(22, 12);     // Offset
    
    // BMP header (for the icon data)
    const bmpHeader = Buffer.alloc(40);
    bmpHeader.writeUInt32LE(40, 0);             // Header size
    bmpHeader.writeInt32LE(width, 4);           // Width
    bmpHeader.writeInt32LE(height * 2, 8);      // Height (doubled for XOR + AND masks)
    bmpHeader.writeUInt16LE(1, 12);             // Planes
    bmpHeader.writeUInt16LE(32, 14);            // Bits per pixel
    bmpHeader.writeUInt32LE(0, 16);             // Compression
    bmpHeader.writeUInt32LE(pixelData.length, 20); // Image size
    
    return Buffer.concat([header, dirEntry, bmpHeader, pixelData]);
}

// Create ICO file
const icoData = createICO();
fs.writeFileSync('aasify.ico', icoData);

console.log('Created aasify.ico icon file successfully');
console.log('Icon size: 16x16 pixels');
console.log('Format: ICO (Windows Icon)');
