import crypto from "crypto"

export function generatePassword(length = 12): string {
  if (length < 1) {
    throw new Error("Password length must be at least 1")
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  const charsLength = chars.length
  const maxByte = 256 - (256 % charsLength)

  let result = ""
  while (result.length < length) {
    const bytes = crypto.randomBytes(length * 2)
    for (const byte of bytes) {
      if (byte < maxByte && result.length < length) {
        result += chars[byte % charsLength]
      }
    }
  }
  return result
}
