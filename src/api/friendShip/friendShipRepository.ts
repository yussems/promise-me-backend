import { FriendshipModel, type IFriendship } from "./friendShipModel";

export class FriendShipRepository {
	async findAllAsync(): Promise<IFriendship[]> {
		try {
			return await FriendshipModel.find().sort({ createdAt: -1 });
		} catch (error) {
			throw new Error(`Failed to fetch friendships: ${(error as Error).message}`);
		}
	}
	async createFriendShip(userIdOne: string, userIdTwo: string): Promise<IFriendship> {
		try {
			return await FriendshipModel.create({ userIdOne, userIdTwo });
		} catch (error) {
			throw new Error(`Failed to create friendship: ${(error as Error).message}`);
		}
	}
}
