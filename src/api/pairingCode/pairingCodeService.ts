import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { IPairingCode } from "./pairingCodeModel";
import { PairingCodeRepository } from "./pairingCodeRepository";

export class PairingCodeService {
	private pairingCodeRepository: PairingCodeRepository;
	constructor(repository: PairingCodeRepository = new PairingCodeRepository()) {
		this.pairingCodeRepository = repository;
	}

	private generatePairingCode(): string {
		return uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
	}

	async createPairingCode(userId: string): Promise<ServiceResponse<IPairingCode | null>> {
		try {
			const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
			const code = this.generatePairingCode();
			const codeHash = crypto.createHash("sha256").update(code).digest("hex");
			const payload = {
				userId: new Types.ObjectId(userId),
				codeHash,
				expiresAt,
				used: false,
			};
			const pairingCode = await this.pairingCodeRepository.createPairingCode(payload);

			return ServiceResponse.success("Pairing code created successfully", pairingCode);
		} catch (error) {
			console.error("Error creating pairing code:", error);
			return ServiceResponse.failure("Failed to create pairing code", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
	async findMinePairingCode(userId: string): Promise<ServiceResponse<IPairingCode | null>> {
		try {
			const pairingCode = await this.pairingCodeRepository.findMinePairingCode(userId);
			if (!pairingCode) {
				return ServiceResponse.failure("Pairing code not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Pairing code found successfully", pairingCode);
		} catch (error) {
			console.error("Error finding pairing code:", error);
			return ServiceResponse.failure("Pairing code not found", null, StatusCodes.NOT_FOUND);
		}
	}
	async findPairingCodeByCodeHash(codeHash: string): Promise<ServiceResponse<IPairingCode | null>> {
		try {
			const pairingCode = await this.pairingCodeRepository.findPairingCodeByCodeHash(codeHash);
			if (!pairingCode) {
				return ServiceResponse.failure("Pairing code not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Pairing code found successfully", pairingCode);
		} catch (error) {
			console.error("Error finding pairing code:", error);
			return ServiceResponse.failure("Pairing code not found", null, StatusCodes.NOT_FOUND);
		}
	}
}

export const pairingCodeService = new PairingCodeService();
