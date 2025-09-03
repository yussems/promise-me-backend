import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";

class UserController {
	public getUsers: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const serviceResponse = await userService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createUser: RequestHandler = async (req: Request, res: Response) => {
		const userData = req.body;
		const serviceResponse = await userService.create(userData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateUser: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const userData = req.body;
		const serviceResponse = await userService.update(id, userData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteUser: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const serviceResponse = await userService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getUserCount: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.getCount();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const userController = new UserController();
