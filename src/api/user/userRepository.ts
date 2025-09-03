import type { User } from "@/api/user/userModel";
import { UserModel, type IUser } from "@/api/user/userModel";

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		try {
			const users = await UserModel.find({}).sort({ createdAt: -1 });
			return users.map((user) => this.mapToUser(user));
		} catch (error) {
			throw new Error(`Failed to fetch users: ${(error as Error).message}`);
		}
	}

	async findByIdAsync(id: string): Promise<User | null> {
		try {
			const user = await UserModel.findById(id);
			return user ? this.mapToUser(user) : null;
		} catch (error) {
			throw new Error(`Failed to fetch user with id ${id}: ${(error as Error).message}`);
		}
	}

	async findByEmailAsync(email: string): Promise<User | null> {
		try {
			const user = await UserModel.findOne({ email: email.toLowerCase() });
			return user ? this.mapToUser(user) : null;
		} catch (error) {
			throw new Error(`Failed to fetch user with email ${email}: ${(error as Error).message}`);
		}
	}

	async createAsync(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
		try {
			const newUser = new UserModel(userData);
			const savedUser = await newUser.save();
			return this.mapToUser(savedUser);
		} catch (error) {
			if ((error as any).code === 11000) {
				throw new Error("User with this email already exists");
			}
			throw new Error(`Failed to create user: ${(error as Error).message}`);
		}
	}

	async updateAsync(id: string, userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null> {
		try {
			const updatedUser = await UserModel.findByIdAndUpdate(
				id,
				{ ...userData, updatedAt: new Date() },
				{ new: true, runValidators: true }
			);
			return updatedUser ? this.mapToUser(updatedUser) : null;
		} catch (error) {
			if ((error as any).code === 11000) {
				throw new Error("User with this email already exists");
			}
			throw new Error(`Failed to update user with id ${id}: ${(error as Error).message}`);
		}
	}

	async deleteAsync(id: string): Promise<boolean> {
		try {
			const result = await UserModel.findByIdAndDelete(id);
			return result !== null;
		} catch (error) {
			throw new Error(`Failed to delete user with id ${id}: ${(error as Error).message}`);
		}
	}

	async countAsync(): Promise<number> {
		try {
			return await UserModel.countDocuments({});
		} catch (error) {
			throw new Error(`Failed to count users: ${(error as Error).message}`);
		}
	}

	private mapToUser(userDoc: IUser): User {
		return {
			id: userDoc._id?.toString() || userDoc.id,
			name: userDoc.name,
			email: userDoc.email,
			age: userDoc.age,
			createdAt: userDoc.createdAt,
			updatedAt: userDoc.updatedAt,
		};
	}
}
