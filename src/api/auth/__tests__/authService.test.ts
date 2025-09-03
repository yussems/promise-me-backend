import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AuthService } from "../authService";
import { AuthModel } from "../authModel";
import { mongoConnection } from "@/common/database/mongoConnection";

describe("AuthService", () => {
	beforeEach(async () => {
		await mongoConnection.connect();
	});

	afterEach(async () => {
		await AuthModel.deleteMany({});
		await mongoConnection.disconnect();
	});

	describe("register", () => {
		it("should register a new user successfully", async () => {
			const email = "test@example.com";
			const password = "password123";

			const result = await AuthService.register(email, password);

			expect(result.success).toBe(true);
			expect(result.message).toBe("User registered successfully");
			expect(result.statusCode).toBe(201);
			expect(result.responseObject).toBeDefined();
			expect(result.responseObject?.email).toBe(email);
		});

		it("should fail when user already exists", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register first user
			await AuthService.register(email, password);

			// Try to register again
			const result = await AuthService.register(email, password);

			expect(result.success).toBe(false);
			expect(result.message).toBe("User with this email already exists");
			expect(result.statusCode).toBe(409);
		});
	});

	describe("login", () => {
		it("should login successfully with correct credentials", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register user first
			await AuthService.register(email, password);

			// Login
			const result = await AuthService.login(email, password);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Login successful");
			expect(result.statusCode).toBe(200);
			expect(result.responseObject).toBeDefined();
			expect(result.responseObject?.user.email).toBe(email);
			expect(result.responseObject?.tokens).toBeDefined();
			expect(result.responseObject?.tokens.accessToken).toBeDefined();
			expect(result.responseObject?.tokens.refreshToken).toBeDefined();
		});

		it("should fail with incorrect password", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register user first
			await AuthService.register(email, password);

			// Try to login with wrong password
			const result = await AuthService.login(email, "wrongpassword");

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid email or password");
			expect(result.statusCode).toBe(401);
		});

		it("should fail with non-existent email", async () => {
			const result = await AuthService.login("nonexistent@example.com", "password123");

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid email or password");
			expect(result.statusCode).toBe(401);
		});
	});

	describe("refreshToken", () => {
		it("should refresh token successfully", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register and login to get tokens
			await AuthService.register(email, password);
			const loginResult = await AuthService.login(email, password);
			const refreshToken = loginResult.responseObject?.tokens.refreshToken;

			expect(refreshToken).toBeDefined();

			// Refresh token
			const result = await AuthService.refreshToken(refreshToken!);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Token refreshed successfully");
			expect(result.statusCode).toBe(200);
			expect(result.responseObject?.accessToken).toBeDefined();
			expect(result.responseObject?.refreshToken).toBeDefined();
		});

		it("should fail with invalid refresh token", async () => {
			const result = await AuthService.refreshToken("invalid-token");

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid refresh token");
			expect(result.statusCode).toBe(401);
		});
	});

	describe("logout", () => {
		it("should logout successfully", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register and login to get tokens
			await AuthService.register(email, password);
			const loginResult = await AuthService.login(email, password);
			const refreshToken = loginResult.responseObject?.tokens.refreshToken;

			expect(refreshToken).toBeDefined();

			// Logout
			const result = await AuthService.logout(refreshToken!);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Logout successful");
			expect(result.statusCode).toBe(200);
		});

		it("should handle logout with non-existent refresh token", async () => {
			const result = await AuthService.logout("non-existent-token");

			expect(result.success).toBe(true);
			expect(result.message).toBe("Logout successful");
			expect(result.statusCode).toBe(200);
		});
	});

	describe("verifyToken", () => {
		it("should verify valid access token", async () => {
			const email = "test@example.com";
			const password = "password123";

			// Register and login to get tokens
			await AuthService.register(email, password);
			const loginResult = await AuthService.login(email, password);
			const accessToken = loginResult.responseObject?.tokens.accessToken;

			expect(accessToken).toBeDefined();

			// Verify token
			const result = await AuthService.verifyToken(accessToken!);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Token verified successfully");
			expect(result.statusCode).toBe(200);
			expect(result.responseObject?.userId).toBeDefined();
		});

		it("should fail with invalid access token", async () => {
			const result = await AuthService.verifyToken("invalid-token");

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid token");
			expect(result.statusCode).toBe(401);
		});
	});
}); 