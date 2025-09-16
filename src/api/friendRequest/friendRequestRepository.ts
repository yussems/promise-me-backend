import { type FriendRequest, FriendRequestModel, type IFriendRequest } from "./friendRequestModel";

export class FriendRequestRepository {
	async createFriendRequest(friendRequest: FriendRequest): Promise<FriendRequest> {
		try {
			const newFriendRequest = new FriendRequestModel(friendRequest);
			const savedFriendRequest = await newFriendRequest.save();
			return this.mapToFriendRequest(savedFriendRequest);
		} catch (error) {
			throw new Error(`Failed to create friend request: ${(error as Error).message}`);
		}
	}
	private mapToFriendRequest(friendRequestDoc: IFriendRequest): FriendRequest {
		return {
			fromUserId: friendRequestDoc.fromUserId.toString(),
			toUserId: friendRequestDoc.toUserId.toString(),
			status: friendRequestDoc.status,
		};
	}
}
