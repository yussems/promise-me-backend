import mongoose from "mongoose";
import type { User } from "@/api/user/userModel";
import { type IUser, UserModel } from "@/api/user/userModel";

export class UserRepository {
	async findByIdAsync(id: string): Promise<User | null> {
		try {
			const user = await UserModel.findById(id);
			return user ? this.mapToUser(user) : null;
		} catch (error) {
			throw new Error(`Failed to fetch user with id ${id}: ${(error as Error).message}`);
		}
	}

	async findByAuthIdAsync(authId: string): Promise<User | null> {
		try {
			const user = await UserModel.findOne({ authId });
			return user ? this.mapToUser(user) : null;
		} catch (error) {
			throw new Error(`Failed to fetch user with authId ${authId}: ${(error as Error).message}`);
		}
	}

	async createAsync(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
		try {
			// Convert string authId to ObjectId for MongoDB
			const mongoUserData = {
				...userData,
				authId: new mongoose.Types.ObjectId(userData.authId),
			};
			const newUser = new UserModel(mongoUserData);
			const savedUser = await newUser.save();
			return this.mapToUser(savedUser);
		} catch (error) {
			if ((error as Error & { code?: number }).code === 11000) {
				throw new Error("User with this email already exists");
			}
			throw new Error(`Failed to create user: ${(error as Error).message}`);
		}
	}

	async updateByAuthIdAsync(
		authId: string,
		userData: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>,
	): Promise<User | null> {
		try {
			const updatedUser = await UserModel.findOneAndUpdate(
				{ authId },
				{ ...userData, updatedAt: new Date() },
				{ new: true, runValidators: true },
			);
			return updatedUser ? this.mapToUser(updatedUser) : null;
		} catch (error) {
			if ((error as Error & { code?: number }).code === 11000) {
				throw new Error("User with this email already exists");
			}
			throw new Error(`Failed to update user with authId ${authId}: ${(error as Error).message}`);
		}
	}

	async findByFriendCodeAsync(friendCode: string): Promise<User | null> {
		try {
			const user = await UserModel.findOne({ friendCode });
			return user ? this.mapToUser(user) : null;
		} catch (error) {
			throw new Error(`Failed to fetch user with friend code ${friendCode}: ${(error as Error).message}`);
		}
	}
	async updateAvatarUrlAsync(id: string, avatarUrl: string): Promise<User | null> {
		try {
			console.log(id, avatarUrl, "----------5---");

			const updatedUser = await UserModel.findByIdAndUpdate(id, { avatarUrl }, { new: true });
			console.log(updatedUser, "----------6---");

			return updatedUser ? this.mapToUser(updatedUser) : null;
		} catch (error) {
			throw new Error(`Failed to update avatar url for user with id ${id}: ${(error as Error).message}`);
		}
	}
	async updateByIdAsync(
		id: string,
		userData: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>,
	): Promise<User | null> {
		try {
			const updatedUser = await UserModel.findByIdAndUpdate(id, userData, { new: true });
			return updatedUser ? this.mapToUser(updatedUser) : null;
		} catch (error) {
			throw new Error(`Failed to update user with id ${id}: ${(error as Error).message}`);
		}
	}

	private mapToUser(userDoc: IUser): User {
		return {
			_id: userDoc._id.toString(),
			authId: userDoc.authId.toString(),
			displayName: userDoc.displayName,
			name: userDoc.name,
			avatarUrl: userDoc.avatarUrl,
			friendCode: userDoc.friendCode,
			friendCodeEnabled: userDoc.friendCodeEnabled,
			friendCodePrivacy: userDoc.friendCodePrivacy,
			friendAutoAccept: userDoc.friendAutoAccept,
		};
	}
}
