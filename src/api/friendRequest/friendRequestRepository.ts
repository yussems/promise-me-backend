import type { Types } from "mongoose";
import { type FriendRequest, FriendRequestModel, type IFriendRequest } from "./friendRequestModel";

// Populate edilmiş tip tanımı - Service'den import edilecek
export interface PopulatedFriendRequest {
	_id: Types.ObjectId;
	fromUserId: {
		_id: Types.ObjectId;
		name: string;
		displayName?: string;
		avatarUrl?: string;
	};
	toUserId: {
		_id: Types.ObjectId;
		name: string;
		displayName?: string;
		avatarUrl?: string;
	};
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

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

	async findMineAsync(userId: string, status: string): Promise<PopulatedFriendRequest[]> {
		try {
			const friendRequests = await FriendRequestModel.find({ fromUserId: userId, status: status })
				.populate("fromUserId", "name displayName avatarUrl")
				.populate("toUserId", "name displayName avatarUrl")
				.lean<PopulatedFriendRequest[]>();

			return friendRequests;
		} catch (error) {
			throw new Error(`Failed to find friend requests: ${(error as Error).message}`);
		}
	}

	async findExistingRequest(fromUserId: string, toUserId: string): Promise<IFriendRequest | null> {
		try {
			const existingRequest = await FriendRequestModel.findOne({
				$or: [
					{ fromUserId, toUserId },
					{ fromUserId: toUserId, toUserId: fromUserId },
				],
			});
			return existingRequest;
		} catch (error) {
			throw new Error(`Failed to check existing friend request: ${(error as Error).message}`);
		}
	}
	async acceptFriendRequest(friendRequestId: string): Promise<FriendRequest | null> {
		try {
			const friendRequest = await FriendRequestModel.findByIdAndUpdate(friendRequestId, { status: "accepted" });
			if (!friendRequest) {
				return null;
			}
			return this.mapToFriendRequest(friendRequest);
		} catch (error) {
			throw new Error(`Failed to accept friend request: ${(error as Error).message}`);
		}
	}
	async rejectFriendRequest(friendRequestId: string): Promise<FriendRequest | null> {
		try {
			const friendRequest = await FriendRequestModel.findByIdAndUpdate(friendRequestId, { status: "rejected" });
			if (!friendRequest) {
				return null;
			}
			return this.mapToFriendRequest(friendRequest);
		} catch (error) {
			throw new Error(`Failed to reject friend request: ${(error as Error).message}`);
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
