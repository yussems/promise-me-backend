import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { pairingCodeService } from "./pairingCodeService";

class PairingCodeController {
	createPairingCode: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId; // Auth token'dan al

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND));
		}
		const pairingCode = await pairingCodeService.createPairingCode(userId);
		httpHandler(res, pairingCode);
	};

	findMinePairingCode: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND));
		}
		const pairingCode = await pairingCodeService.findMinePairingCode(userId);

		httpHandler(res, pairingCode);
	};
}
export const pairingCodeController = new PairingCodeController();
