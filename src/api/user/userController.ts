import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
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
		console.log("findByAuthId", result, "------------");

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
}

export const userController = new UserController();
