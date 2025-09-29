import type { Types } from "mongoose";
import { type IPairingCode, PairingCode } from "./pairingCodeModel";

export class PairingCodeRepository {
	async createPairingCode(pairingCodeData: {
		userId: Types.ObjectId;
		codeHash: string;
		used: boolean;
		expiresAt: Date;
	}): Promise<IPairingCode> {
		return PairingCode.create(pairingCodeData);
	}
	async findMinePairingCode(userId: string): Promise<IPairingCode | null> {
		return PairingCode.findOne({ userId }).sort({ createdAt: -1 });
	}
	async findPairingCodeByCodeHash(codeHash: string): Promise<IPairingCode | null> {
		return PairingCode.findOne({ codeHash });
	}
}
