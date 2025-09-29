import { StatusCodes } from "http-status-codes";
import { UserService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { FriendShipService } from "../friendShip/friendShipService";
import { PairingCodeService } from "../pairingCode/pairingCodeService";
import type { FriendRequest } from "./friendRequestModel";
import { FriendRequestRepository, type PopulatedFriendRequest } from "./friendRequestRepository";

export class FriendRequestService {
	private friendRequestRepository: FriendRequestRepository;
	private userService: UserService;
	private friendShipService: FriendShipService;
	private pairingCodeService: PairingCodeService;
	constructor(
		repository: FriendRequestRepository = new FriendRequestRepository(),
		userService: UserService = new UserService(),
		friendShipService: FriendShipService = new FriendShipService(),
		pairingCodeService: PairingCodeService = new PairingCodeService(),
	) {
		this.friendRequestRepository = repository;
		this.userService = userService;
		this.friendShipService = friendShipService;
		this.pairingCodeService = pairingCodeService;
	}

	async createFriendRequest(friendRequest: FriendRequest): Promise<ServiceResponse<FriendRequest>> {
		try {
			const newFriendRequest = await this.friendRequestRepository.createFriendRequest(friendRequest);
			return ServiceResponse.success("Friend request created successfully", newFriendRequest);
		} catch (error) {
			console.error("Error creating friend request:", error);
			return ServiceResponse.failure(
				"Failed to create friend request",
				null as unknown as FriendRequest,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
	async findMineAsync(userId: string, status: string): Promise<ServiceResponse<PopulatedFriendRequest[]>> {
		try {
			const friendRequests = await this.friendRequestRepository.findMineAsync(userId, status);
			return ServiceResponse.success("Friend requests found successfully", friendRequests);
		} catch (error) {
			console.error("Error finding friend requests:", error);
			return ServiceResponse.failure(
				"Failed to find friend requests",
				null as unknown as PopulatedFriendRequest[],
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
	async sendFriendRequestByCode(fromUserId: string, friendCode: string): Promise<ServiceResponse<FriendRequest>> {
		try {
			// Friend code ile kullanıcıyı bul
			const targetUser = await this.userService.findByFriendCode(friendCode);
			if (!targetUser.success || !targetUser.responseObject) {
				return ServiceResponse.failure(
					"Friend code not found",
					null as unknown as FriendRequest,
					StatusCodes.NOT_FOUND,
				);
			}

			// Kendine arkadaşlık isteği gönderemez
			if (fromUserId === targetUser.responseObject._id) {
				return ServiceResponse.failure(
					"Cannot send friend request to yourself",
					null as unknown as FriendRequest,
					StatusCodes.BAD_REQUEST,
				);
			}

			// Zaten arkadaşlık isteği var mı kontrol et
			const existingRequest = await this.friendRequestRepository.findExistingRequest(
				fromUserId,
				targetUser.responseObject._id,
			);
			if (existingRequest) {
				return ServiceResponse.failure(
					"Friend request already exists",
					null as unknown as FriendRequest,
					StatusCodes.CONFLICT,
				);
			}

			// Arkadaşlık isteği oluştur
			const friendRequestData = {
				fromUserId,
				toUserId: targetUser.responseObject._id,
				status: "pending",
			};

			const friendRequest = await this.friendRequestRepository.createFriendRequest(friendRequestData);
			return ServiceResponse.success("Friend request sent successfully", friendRequest);
		} catch (error) {
			console.error("Error sending friend request by code:", error);
			return ServiceResponse.failure(
				"Failed to send friend request",
				null as unknown as FriendRequest,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
	async acceptFriendRequest(friendRequestId: string): Promise<ServiceResponse<FriendRequest>> {
		try {
			const friendRequest = await this.friendRequestRepository.acceptFriendRequest(friendRequestId);
			if (!friendRequest) {
				return ServiceResponse.failure(
					"Friend request not found",
					null as unknown as FriendRequest,
					StatusCodes.NOT_FOUND,
				);
			}
			await this.friendShipService.createFriendShip(friendRequest.fromUserId, friendRequest.toUserId);
			return ServiceResponse.success("Friend request accepted successfully", friendRequest);
		} catch (error) {
			console.error("Error accepting friend request:", error);
			return ServiceResponse.failure(
				"Failed to accept friend request",
				null as unknown as FriendRequest,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
	async rejectFriendRequest(friendRequestId: string): Promise<ServiceResponse<FriendRequest>> {
		try {
			const friendRequest = await this.friendRequestRepository.rejectFriendRequest(friendRequestId);
			if (!friendRequest) {
				return ServiceResponse.failure(
					"Friend request not found",
					null as unknown as FriendRequest,
					StatusCodes.NOT_FOUND,
				);
			}
			return ServiceResponse.success("Friend request rejected successfully", friendRequest);
		} catch (error) {
			console.error("Error rejecting friend request:", error);
			return ServiceResponse.failure(
				"Failed to reject friend request",
				null as unknown as FriendRequest,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
	async sendFriendRequestByPairingCode(
		fromUserId: string,
		pairingCode: string,
	): Promise<ServiceResponse<FriendRequest>> {
		try {
			const pairingCodeResponse = await this.pairingCodeService.findPairingCodeByCodeHash(pairingCode);
			if (!pairingCodeResponse.success || !pairingCodeResponse.responseObject) {
				return ServiceResponse.failure(
					"Pairing code not found",
					null as unknown as FriendRequest,
					StatusCodes.NOT_FOUND,
				);
			}
			const existingRequest = await this.friendRequestRepository.findExistingRequest(
				fromUserId,
				pairingCodeResponse.responseObject._id.toString(),
			);
			if (existingRequest) {
				return ServiceResponse.failure(
					"Friend request already exists",
					null as unknown as FriendRequest,
					StatusCodes.CONFLICT,
				);
			}
			const friendRequestData = {
				fromUserId,
				toUserId: pairingCodeResponse.responseObject._id.toString(),
				status: "pending",
			};
			const friendRequest = await this.friendRequestRepository.createFriendRequest(friendRequestData);
			return ServiceResponse.success("Friend request sent successfully", friendRequest);
		} catch (error) {
			console.error("Error sending friend request by pairing code:", error);
			return ServiceResponse.failure(
				"Failed to send friend request by pairing code",
				null as unknown as FriendRequest,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const friendRequestService = new FriendRequestService();
