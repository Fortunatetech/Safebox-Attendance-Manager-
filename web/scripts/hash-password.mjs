#!/usr/bin/env node
// Generates a bcrypt hash for ADMIN_PASSWORD_HASH without ever writing the plaintext password to disk.
// Usage: node scripts/hash-password.mjs "your-password"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
