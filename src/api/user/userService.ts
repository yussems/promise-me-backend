import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	// Retrieves all users from the database
	async findAll(): Promise<ServiceResponse<User[] | null>> {
		try {
			const users = await this.userRepository.findAllAsync();
			if (!users || users.length === 0) {
				return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User[]>("Users found", users);
		} catch (ex) {
			const errorMessage = `Error finding all users: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single user by their ID
	async findById(id: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Creates a new user
	async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<ServiceResponse<User | null>> {
		try {
			// Check if user with email already exists
			const existingUser = await this.userRepository.findByEmailAsync(userData.email);
			if (existingUser) {
				return ServiceResponse.failure("User with this email already exists", null, StatusCodes.CONFLICT);
			}

			const newUser = await this.userRepository.createAsync(userData);
			return ServiceResponse.success<User>("User created successfully", newUser, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating user: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Updates an existing user
	async update(id: string, userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<ServiceResponse<User | null>> {
		try {
			// Check if user exists
			const existingUser = await this.userRepository.findByIdAsync(id);
			if (!existingUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			// If email is being updated, check if new email already exists
			if (userData.email && userData.email !== existingUser.email) {
				const userWithEmail = await this.userRepository.findByEmailAsync(userData.email);
				if (userWithEmail) {
					return ServiceResponse.failure("User with this email already exists", null, StatusCodes.CONFLICT);
				}
			}

			const updatedUser = await this.userRepository.updateAsync(id, userData);
			if (!updatedUser) {
				return ServiceResponse.failure("Failed to update user", null, StatusCodes.INTERNAL_SERVER_ERROR);
			}

			return ServiceResponse.success<User>("User updated successfully", updatedUser);
		} catch (ex) {
			const errorMessage = `Error updating user with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while updating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Deletes a user
	async delete(id: string): Promise<ServiceResponse<boolean | null>> {
		try {
			// Check if user exists
			const existingUser = await this.userRepository.findByIdAsync(id);
			if (!existingUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const deleted = await this.userRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Failed to delete user", null, StatusCodes.INTERNAL_SERVER_ERROR);
			}

			return ServiceResponse.success<boolean>("User deleted successfully", true);
		} catch (ex) {
			const errorMessage = `Error deleting user with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get user count
	async getCount(): Promise<ServiceResponse<number | null>> {
		try {
			const count = await this.userRepository.countAsync();
			return ServiceResponse.success<number>("User count retrieved", count);
		} catch (ex) {
			const errorMessage = `Error getting user count: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while getting user count.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();
