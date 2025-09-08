// src/common/friendCode.ts
import { UserModel } from "@/api/user/userModel";
import crypto from "crypto";

// Tek seferlik random numeric string üretir
function generateNumericCode(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += (bytes[i] % 10).toString(); // 0–9
  }
  return code;
}

// DB'de çakışma kontrolü yaparak benzersiz friendCode üretir
export async function generateUniqueFriendCode(
  length = 10,
  maxRetries = 5
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const candidate = generateNumericCode(length);
    const exists = await UserModel.exists({ friendCode: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Could not generate unique friend code");
}
