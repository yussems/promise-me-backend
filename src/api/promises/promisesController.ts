import type { Request, RequestHandler, Response } from "express";
import { httpHandler } from "@/common/utils/httpHandlers";
import { promisesService } from "./promisesService";

class PromisesController {
	create: RequestHandler = async (req: Request, res: Response) => {
		const promiseData = req.body;
		const result = await promisesService.createPromise(promiseData);
		httpHandler(res, result);
	};
}

export const promisesController = new PromisesController();
