import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
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
	async updateUser(
		userId: string,
		updateData: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>,
	): Promise<ServiceResponse<User | null>> {
		try {
			const updatedUser = await this.userRepository.updateAsync(userId, updateData);
			if (!updatedUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User updated successfully", updatedUser);
		} catch (error) {
			console.error("Error updating user:", error);
			return ServiceResponse.failure("Failed to update user", null, StatusCodes.INTERNAL_SERVER_ERROR);
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

	async updateByAuthId(
		authId: string,
		updateData: Partial<Omit<User, "_id" | "createdAt" | "updatedAt" | "authId">>,
	): Promise<ServiceResponse<User | null>> {
		try {
			const updatedUser = await this.userRepository.updateByAuthIdAsync(authId, updateData);
			if (!updatedUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User updated successfully", updatedUser);
		} catch (error) {
			console.error("Error updating user:", error);
			return ServiceResponse.failure("Failed to update user", null, StatusCodes.INTERNAL_SERVER_ERROR);
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
}
export const userService = new UserService();
