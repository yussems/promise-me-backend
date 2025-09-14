import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { pairingCodeService } from "./pairingCodeService";

class PairingCodeController {
	createPairingCode: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId; // Auth token'dan al
		console.log("createPairingCode", userId, "------------");

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND));
		}
		const pairingCode = await pairingCodeService.createPairingCode(userId);
		httpHandler(res, pairingCode);
	};

	findMinePairingCode: RequestHandler = async (req: Request, res: Response) => {
		console.log("findMinePairingCode", req.user, "------------");
		const userId = req.user?.userId;
		console.log("findMinePairingCode", userId, "------------");

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND));
		}
		const pairingCode = await pairingCodeService.findMinePairingCode(userId);
		console.log("findMinePairingCode", pairingCode, "------------");

		httpHandler(res, pairingCode);
	};
}
export const pairingCodeController = new PairingCodeController();
