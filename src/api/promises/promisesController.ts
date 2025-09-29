import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { promisesService } from "./promisesService";

class PromisesController {
	create: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not authenticated", null, StatusCodes.UNAUTHORIZED));
		}

		const promiseData = {
			...req.body,
			createdBy: userId,
		};

		const result = await promisesService.createPromise(promiseData);
		httpHandler(res, result);
	};
	findByUserId: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not authenticated", null, StatusCodes.UNAUTHORIZED));
		}
		const result = await promisesService.findByUserId(userId);
		httpHandler(res, result);
	};
	findById: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const result = await promisesService.findById(id);
		httpHandler(res, result);
	};
}

export const promisesController = new PromisesController();
