import type { Request, RequestHandler, Response } from "express";
import { friendShipService } from "./friendShipService";

class FriendshipController {
	async getFriends(req: Request, res: Response) {
		try {
			const friends = await friendShipService.findAll(req.user?.userId as string);
			res.status(200).json(friends);
		} catch (error) {
			res.status(500).json({ message: (error as Error).message });
		}
	}
}

export const friendshipController = new FriendshipController();
