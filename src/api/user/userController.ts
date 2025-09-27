import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";

class UserController {
	findById: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const result = await userService.findById(id);
		httpHandler(res, result);
	};

	findByAuthId: RequestHandler = async (req: Request, res: Response) => {
		const { authId } = req.params;
		const result = await userService.findByAuthId(authId);

		res.status(result.statusCode).send(result);
	};

	createByAuthId: RequestHandler = async (req: Request, res: Response) => {
		const { authId } = req.params;
		const userData = req.body;
		const result = await userService.createByAuthId(authId, userData);
		httpHandler(res, result);
	};

	updateByAuthId: RequestHandler = async (req: Request, res: Response) => {
		const { authId } = req.params;
		const updateData = req.body;
		const result = await userService.updateByAuthId(authId, updateData);
		httpHandler(res, result);
	};
	updateAvatarUrl: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const { filename, contentType } = req.body;
		console.log(filename, contentType, "*****");

		try {
			const result = await userService.updateAvatarUrl(id, filename, contentType);
			httpHandler(res, result);
		} catch (error) {
			console.error("Error in updateAvatarUrl controller:", error);
			httpHandler(res, ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR));
		}
	};
}

export const userController = new UserController();
