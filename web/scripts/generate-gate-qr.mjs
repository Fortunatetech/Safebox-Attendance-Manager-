#!/usr/bin/env node
// Generates the office gate QR code (printable PNG) and the matching secret to
// set as GATE_QR_SECRET in .env.local and Vercel. Re-run with an existing secret
// as an argument to regenerate the image without changing the code:
//   node scripts/generate-gate-qr.mjs [existing-secret]
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const secret = process.argv[2] || `SBX-GATE-${randomBytes(5).toString("hex")}`;
const outPath = fileURLToPath(new URL("../gate-qr.png", import.meta.url));

await QRCode.toFile(outPath, secret, {
  errorCorrectionLevel: "H",
  margin: 3,
  width: 1000,
});

console.log("Gate secret:", secret);
console.log("QR image written to:", outPath);
console.log("\nSet GATE_QR_SECRET to the value above in .env.local and in Vercel.");
