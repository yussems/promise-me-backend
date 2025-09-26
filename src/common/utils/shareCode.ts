import { parse as uuidParse, v4 as uuidv4 } from "uuid";

export function genShareCode(): string {
	const bytes = uuidParse(uuidv4()); // 16 byte
	return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); // → örn: "Q2K1m8m8Qz2Q3m8s3nG6xw"
}
