import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { UserModel } from "../user/userModel";
import { AuthModel, type IAuth } from "./authModel";

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface LoginResult {
	user: {
		id: string;
		email: string;
		isActive: boolean;
		lastLogin?: Date;
		createdAt: Date;
		updatedAt: Date;
	};
	tokens: AuthTokens;
}

export class AuthService {
	private generateTokens(userId: string): AuthTokens {
		const accessToken = jwt.sign({ userId, type: "access" }, env.JWT_SECRET, { expiresIn: "1m" });

		const refreshToken = jwt.sign({ userId, type: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

		return { accessToken, refreshToken };
	}

	private async hashPassword(password: string): Promise<string> {
		const saltRounds = 12;
		return bcrypt.hash(password, saltRounds);
	}

	private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	}

	async register(email: string, password: string): Promise<ServiceResponse<Omit<IAuth, "password" | "refreshToken">>> {
		try {
			// Check if user already exists
			const existingUser = await AuthModel.findOne({ email });
			if (existingUser) {
				return ServiceResponse.failure("User with this email already exists", null as any, 409);
			}

			// Hash password
			const hashedPassword = await this.hashPassword(password);

			// Create new user
			const newUser = new AuthModel({
				email,
				password: hashedPassword,
			});

			await newUser.save();

			// Return user without sensitive data
			const { password: _, refreshToken: __, ...userWithoutSensitiveData } = newUser.toObject();

			return ServiceResponse.success("User registered successfully", userWithoutSensitiveData as any, 201);
		} catch (error) {
			return ServiceResponse.failure("Failed to register user", null as any, 500);
		}
	}

	async login(email: string, password: string): Promise<ServiceResponse<LoginResult>> {
		try {
			// Find user by email
			const user = await AuthModel.findOne({ email });
			if (!user) {
				return ServiceResponse.failure("Invalid email or password", null as any, 401);
			}

			// Check if user is active
			if (!user.isActive) {
				return ServiceResponse.failure("Account is deactivated", null as any, 401);
			}

			// Verify password
			const isPasswordValid = await this.comparePassword(password, user.password);
			if (!isPasswordValid) {
				return ServiceResponse.failure("Invalid email or password", null as any, 401);
			}

			// Generate tokens
			const tokens = this.generateTokens(user.id);

			// Update user with refresh token and last login
			user.refreshToken = tokens.refreshToken;
			user.lastLogin = new Date();
			await user.save();

			// Return user and tokens
			const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();

			return ServiceResponse.success(
				"Login successful",
				{
					user: userWithoutSensitiveData as any,
					tokens,
				},
				200,
			);
		} catch (error) {
			return ServiceResponse.failure("Failed to login", null as any, 500);
		}
	}

	async refreshToken(refreshToken: string): Promise<ServiceResponse<AuthTokens>> {
		try {
			// Verify refresh token
			const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; type: string };

			if (decoded.type !== "refresh") {
				return ServiceResponse.failure("Invalid token type", null as any, 401);
			}

			// Find user and verify refresh token
			const user = await AuthModel.findById(decoded.userId);
			if (!user || user.refreshToken !== refreshToken) {
				return ServiceResponse.failure("Invalid refresh token", null as any, 401);
			}

			// Check if user is active
			if (!user.isActive) {
				return ServiceResponse.failure("Account is deactivated", null as any, 401);
			}

			// Generate new tokens
			const newTokens = this.generateTokens(user.id);

			// Update refresh token
			user.refreshToken = newTokens.refreshToken;
			await user.save();

			return ServiceResponse.success("Token refreshed successfully", newTokens, 200);
		} catch (error) {
			return ServiceResponse.failure("Invalid refresh token", null as any, 401);
		}
	}

	async logout(refreshToken: string): Promise<ServiceResponse<null>> {
		try {
			// Find user by refresh token
			const user = await AuthModel.findOne({ refreshToken });
			if (user) {
				// Clear refresh token
				user.refreshToken = undefined;
				await user.save();
			}

			return ServiceResponse.success("Logout successful", null, 200);
		} catch (error) {
			return ServiceResponse.failure("Failed to logout", null, 500);
		}
	}

	async verifyToken(token: string): Promise<ServiceResponse<{ authId: string; userId: string }>> {
		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; type: string };

			if (decoded.type !== "access") {
				return ServiceResponse.failure("Invalid token type", null as any, 401);
			}

			// Check if user exists and is active
			const auth = await AuthModel.findById(decoded.userId);

			if (!auth || !auth.isActive) {
				return ServiceResponse.failure("User not found or inactive", null as any, 401);
			}
			const user = await UserModel.findOne({ authId: auth._id });
			if (!user) {
				return ServiceResponse.failure("User profile not found", null as any, 401);
			}
			console.log(auth, "auth");

			return ServiceResponse.success(
				"Token verified successfully",
				{ authId: decoded.userId, userId: user?._id.toString() },
				200,
			);
		} catch (error) {
			return ServiceResponse.failure("Invalid token", null as any, 401);
		}
	}
}

export const authService = new AuthService();
