import zlib from "zlib";

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([t, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

/**
 * Generates an official medical optical prescription PNG image card
 */
export function createPrescriptionPng(width = 800, height = 500, title = "NAYANTARA OPTICALS PRESCRIPTION"): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk("IHDR", ihdr);

  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0; // Filter byte
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 3;
      if (y < 70) {
        // Clinical Navy/Teal Header
        rawData[pxOffset] = 15;
        rawData[pxOffset + 1] = 118;
        rawData[pxOffset + 2] = 110;
      } else if (y >= 70 && y <= 74) {
        // Amber Accent
        rawData[pxOffset] = 217;
        rawData[pxOffset + 1] = 119;
        rawData[pxOffset + 2] = 6;
      } else if (x === 0 || x === width - 1 || y === height - 1) {
        // Border
        rawData[pxOffset] = 203;
        rawData[pxOffset + 1] = 213;
        rawData[pxOffset + 2] = 225;
      } else {
        // Background
        const isTableLine = (y >= 140 && y <= 320) && (y % 40 === 0 || x % 120 === 0);
        if (isTableLine) {
          rawData[pxOffset] = 226;
          rawData[pxOffset + 1] = 232;
          rawData[pxOffset + 2] = 240;
        } else {
          rawData[pxOffset] = 248;
          rawData[pxOffset + 1] = 250;
          rawData[pxOffset + 2] = 252;
        }
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", idatData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Generates an official medical optical prescription PDF report
 */
export function createPrescriptionPdf(patientName: string, doctorName = "Dr. S. Mukherjee, M.Optom"): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Title (Nayantara Opticals - Digital Prescription Vault)
   /Author (Nayantara Opticals)
   /Creator (Nayantara Clinical Eyecare Engine) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page
   /Parent 3 0 R
   /MediaBox [0 0 612 792]
   /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
   /Contents 7 0 R >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
7 0 obj
<< /Length 760 >>
stream
BT
/F1 22 Tf
50 720 Td
(NAYANTARA OPTICALS) Tj
/F2 11 Tf
0 -18 Td
(Clinical Eyecare & Digital Prescription Vault) Tj
0 -15 Td
(Kolkata, West Bengal | Phone: +91 98765 43210 | www.nayantaraopticals.com) Tj

/F1 14 Tf
0 -40 Td
(OFFICIAL CLINICAL PRESCRIPTION RECORD) Tj

/F2 10 Tf
0 -25 Td
(Patient Name: ${patientName.replace(/[()]/g, "")}) Tj
0 -15 Td
(Prescription Status: VERIFIED & ACTIVE IN CLINIC VAULT) Tj
0 -15 Td
(Verified Optometrist: ${doctorName}) Tj

/F1 12 Tf
0 -35 Td
(OPTICAL CORRECTION DETAILS:) Tj
/F2 10 Tf
0 -20 Td
(Right Eye (OD): Sphere: -1.25  |  Cylinder: -0.50  |  Axis: 90 deg  |  PD: 63mm) Tj
0 -18 Td
(Left Eye  (OS): Sphere: -1.00  |  Cylinder: -0.25  |  Axis: 85 deg  |  Addition: +1.50) Tj

/F1 11 Tf
0 -30 Td
(Optometrist Clinical Recommendations:) Tj
/F2 10 Tf
0 -16 Td
(1. Anti-Reflective Blue Cut Premium Coating for digital screen protection.) Tj
0 -14 Td
(2. Recommended follow-up in 12 months.) Tj

/F1 10 Tf
0 -60 Td
(Digitally authenticated and sealed by Nayantara Opticals Clinical Eyecare Engine.) Tj
ET
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000015 00000 n 
0000000155 00000 n 
0000000208 00000 n 
0000000267 00000 n 
0000000416 00000 n 
0000000486 00000 n 
0000000551 00000 n 
trailer
<< /Size 8 /Root 2 0 R /Info 1 0 R >>
startxref
1370
%%EOF`;
  return Buffer.from(content, "utf-8");
}
