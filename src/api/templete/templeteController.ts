import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { templeteService } from "./templeteService";

class TempleteController {
	findAll: RequestHandler = async (_req: Request, res: Response) => {
		const result = await templeteService.findAllTemplates();
		httpHandler(res, result);
	};
}

export const templeteController = new TempleteController();
