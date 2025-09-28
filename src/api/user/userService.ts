import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { FileService } from "../upload/fileService";

export class UserService {
	private userRepository: UserRepository;
	private fileService: FileService;
	constructor(repository: UserRepository = new UserRepository(), fileService: FileService = new FileService()) {
		this.userRepository = repository;
		this.fileService = fileService;
	}

	async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<ServiceResponse<User | null>> {
		try {
			const newUser = await this.userRepository.createAsync(userData);
			return ServiceResponse.success<User>("User created successfully", newUser);
		} catch (error) {
			console.error("Error creating user:", error);
			return ServiceResponse.failure("Failed to create user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async findById(id: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (error) {
			console.error("Error finding user:", error);
			return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
		}
	}

	async findByAuthId(authId: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByAuthIdAsync(authId);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (error) {
			console.error("Error finding user:", error);
			return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
		}
	}

	async createByAuthId(
		authId: string,
		userData: Omit<User, "_id" | "createdAt" | "updatedAt" | "authId">,
	): Promise<ServiceResponse<User | null>> {
		try {
			const newUser = await this.userRepository.createAsync({
				...userData,
				authId,
			});
			return ServiceResponse.success<User>("User created successfully", newUser);
		} catch (error) {
			console.error("Error creating user:", error);
			return ServiceResponse.failure("Failed to create user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateAvatarUrl(
		userId: string,
		filename: string,
		contentType: string,
	): Promise<ServiceResponse<{ uploadUrl: string; user: any } | null>> {
		try {
			// 1) File kaydı oluştur + pre-signed uploadUrl üret
			const { file, uploadUrl } = await this.fileService.requestUpload(userId, filename, contentType, {
				kind: "user",
				itemId: userId,
			});
			// 2) avatarUrl hazırla (ister API download endpoint, ister R2 public URL)
			const avatarUrl = `/files/${file._id}/download`;
			// 3) user tablosunda avatarUrl güncelle
			const updatedUser = await this.userRepository.updateAvatarUrlAsync(userId, avatarUrl);

			if (!updatedUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			// 4) uploadUrl + updatedUser dön
			return ServiceResponse.success("Avatar url updated successfully", {
				uploadUrl,
				user: updatedUser,
			});
		} catch (error) {
			console.error("Error updating avatar url:", error);
			return ServiceResponse.failure("Failed to update avatar url", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
	async findByFriendCode(friendCode: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByFriendCodeAsync(friendCode);
			if (!user) {
				return ServiceResponse.failure("Friend code not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (error) {
			console.error("Error finding user by friend code:", error);
			return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
		}
	}
	async updateById(
		id: string,
		updateData: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>,
	): Promise<ServiceResponse<User | null>> {
		try {
			const updatedUser = await this.userRepository.updateByIdAsync(id, updateData);
			if (!updatedUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User updated successfully", updatedUser);
		} catch (error) {
			console.error("Error updating user:", error);
			return ServiceResponse.failure("Failed to update user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
export const userService = new UserService();
