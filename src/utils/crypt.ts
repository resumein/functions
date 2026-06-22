import crypto from "crypto";

const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        KEY,
        iv
    );

    const encrypted =
        cipher.update(text, "utf8", "hex") +
        cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(":");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        KEY,
        Buffer.from(ivHex, "hex")
    );

    return (
        decipher.update(encrypted, "hex", "utf8") +
        decipher.final("utf8")
    );
}