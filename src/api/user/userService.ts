import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<ServiceResponse<User | null>> {
    try {
      const newUser = await this.userRepository.createAsync(userData);
      return ServiceResponse.success<User>(
        "User created successfully",
        newUser
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to create user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async updateUser(
    userId: string,
    updateData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<ServiceResponse<User | null>> {
    try {
      const updatedUser = await this.userRepository.updateAsync(
        userId,
        updateData
      );
      if (!updatedUser) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<User>(
        "User updated successfully",
        updatedUser
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to update user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export const userService = new UserService();
