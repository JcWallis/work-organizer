/**
 * Run: npx ts-node -e "require('./scripts/hash-password.ts')"
 * Or:  node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 12).then(console.log)"
 *
 * Usage: node scripts/hash-password.mjs <password>
 */

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nAdd this to your .env:\n");
console.log(`APP_PASSWORD_HASH="${hash}"`);
