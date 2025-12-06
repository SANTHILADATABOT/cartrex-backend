const crypto = require("crypto");

const SECRET = process.env.KEY_SECRET; // must be 32 chars (AES-256)
// if (!SECRET || SECRET.length !== 32) {
//   throw new Error("❌ KEY_SECRET must be 32 characters long.");
// }

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.KEY_SECRET, "hex");
// 🔐 Encrypt
function encrypt(text) {
  const iv = crypto.randomBytes(16); // generate new IV for every encryption
  const cipher = crypto.createCipheriv(algorithm, key , iv);

  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// 🔓 Decrypt
function decrypt(text) {
  if (!text) return "";

  const [ivHex, encryptedHex] = text.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };
