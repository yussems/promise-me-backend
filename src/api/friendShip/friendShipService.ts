import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { FriendSummary, IFriendship } from "./friendShipModel";
import { FriendShipRepository } from "./friendShipRepository";

export class FriendShipService {
	private friendShipRepository: FriendShipRepository;

	constructor(repository: FriendShipRepository = new FriendShipRepository()) {
		this.friendShipRepository = repository;
	}

	async findAll(userId: string): Promise<ServiceResponse<FriendSummary[] | null>> {
		try {
			const friendships = await this.friendShipRepository.findAllByUserIdAsync(userId);

			const friends: FriendSummary[] = friendships.map((rel) => {
				const friend = rel.userIdOne._id.toString() === userId ? rel.userIdTwo : rel.userIdOne;
				return {
					_id: friend._id.toString(),
					name: friend.name,
					displayName: friend.displayName,
					avatarUrl: friend.avatarUrl,
				};
			});

			return ServiceResponse.success("Friends fetched successfully", friends);
		} catch (error) {
			console.error("Error fetching friends:", error);
			return ServiceResponse.failure("Failed to fetch friends", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createFriendShip(userIdOne: string, userIdTwo: string): Promise<ServiceResponse<IFriendship | null>> {
		try {
			const friendship = await this.friendShipRepository.createFriendShip(userIdOne, userIdTwo);
			return ServiceResponse.success("Friendship created successfully", friendship);
		} catch (error) {
			console.error("Error creating friendship:", error);
			return ServiceResponse.failure("Failed to create friendship", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const friendShipService = new FriendShipService();
