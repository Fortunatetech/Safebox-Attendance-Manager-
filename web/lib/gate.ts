/**
 * Verifies a scanned gate-QR code against the configured secret.
 * The QR code posted at the office gate encodes a fixed string (GATE_QR_SECRET);
 * scanning it is how the kiosk confirms the phone is physically at the gate for
 * that specific sign-in/sign-out action, rather than being able to sign in from anywhere.
 */
export function isGateConfigured(): boolean {
  return Boolean(process.env.GATE_QR_SECRET);
}

export function verifyGateScan(scanned: string | null | undefined): boolean {
  if (!isGateConfigured()) return true;
  if (!scanned) return false;
  return scanned.trim() === process.env.GATE_QR_SECRET;
}
