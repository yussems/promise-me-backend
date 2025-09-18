import { FriendshipModel, type IFriendship, type IFriendshipPopulated } from "./friendShipModel";

export class FriendShipRepository {
	async findAllByUserIdAsync(userId: string): Promise<IFriendshipPopulated[]> {
		const rels = await FriendshipModel.find({
			$or: [{ userIdOne: userId }, { userIdTwo: userId }],
		})
			.select("userIdOne userIdTwo")
			.sort({ updatedAt: -1, _id: -1 })
			.populate<IFriendshipPopulated>([
				{ path: "userIdOne", select: "name displayName avatarUrl" },
				{ path: "userIdTwo", select: "name displayName avatarUrl" },
			])
			.lean();
		return rels;
	}

	async createFriendShip(userIdOne: string, userIdTwo: string): Promise<IFriendship> {
		return await FriendshipModel.create({ userIdOne, userIdTwo });
	}
}
