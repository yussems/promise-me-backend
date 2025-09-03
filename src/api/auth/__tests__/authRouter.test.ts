import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "@/server";
import { AuthModel } from "../authModel";
import { mongoConnection } from "@/common/database/mongoConnection";

describe("AuthRouter", () => {
	beforeEach(async () => {
		await mongoConnection.connect();
	});

	afterEach(async () => {
		await AuthModel.deleteMany({});
		await mongoConnection.disconnect();
	});

	describe("POST /auth/register", () => {
		it("should register a new user successfully", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("User registered successfully");
			expect(response.body.responseObject.email).toBe(userData.email);
			expect(response.body.responseObject.password).toBeUndefined();
		});

		it("should fail when passwords don't match", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "differentpassword",
			};

			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it("should fail when user already exists", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register first user
			await request(app).post("/auth/register").send(userData);

			// Try to register again
			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(409);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("User with this email already exists");
		});
	});

	describe("POST /auth/login", () => {
		it("should login successfully with correct credentials", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register user first
			await request(app).post("/auth/register").send(userData);

			// Login
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: userData.email,
					password: userData.password,
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Login successful");
			expect(response.body.responseObject.user.email).toBe(userData.email);
			expect(response.body.responseObject.tokens.accessToken).toBeDefined();
			expect(response.body.responseObject.tokens.refreshToken).toBeDefined();
		});

		it("should fail with incorrect password", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register user first
			await request(app).post("/auth/register").send(userData);

			// Try to login with wrong password
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: userData.email,
					password: "wrongpassword",
				})
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Invalid email or password");
		});
	});

	describe("POST /auth/refresh", () => {
		it("should refresh token successfully", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register and login to get tokens
			await request(app).post("/auth/register").send(userData);
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({
					email: userData.email,
					password: userData.password,
				});

			const refreshToken = loginResponse.body.responseObject.tokens.refreshToken;

			// Refresh token
			const response = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Token refreshed successfully");
			expect(response.body.responseObject.accessToken).toBeDefined();
			expect(response.body.responseObject.refreshToken).toBeDefined();
		});

		it("should fail with invalid refresh token", async () => {
			const response = await request(app)
				.post("/auth/refresh")
				.send({ refreshToken: "invalid-token" })
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Invalid refresh token");
		});
	});

	describe("POST /auth/logout", () => {
		it("should logout successfully", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register and login to get tokens
			await request(app).post("/auth/register").send(userData);
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({
					email: userData.email,
					password: userData.password,
				});

			const refreshToken = loginResponse.body.responseObject.tokens.refreshToken;

			// Logout
			const response = await request(app)
				.post("/auth/logout")
				.send({ refreshToken })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Logout successful");
		});
	});

	describe("GET /auth/verify", () => {
		it("should verify valid access token", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				confirmPassword: "password123",
			};

			// Register and login to get tokens
			await request(app).post("/auth/register").send(userData);
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({
					email: userData.email,
					password: userData.password,
				});

			const accessToken = loginResponse.body.responseObject.tokens.accessToken;

			// Verify token
			const response = await request(app)
				.get("/auth/verify")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Token verified successfully");
			expect(response.body.responseObject.userId).toBeDefined();
		});

		it("should fail without authorization header", async () => {
			const response = await request(app)
				.get("/auth/verify")
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("No token provided");
		});

		it("should fail with invalid token", async () => {
			const response = await request(app)
				.get("/auth/verify")
				.set("Authorization", "Bearer invalid-token")
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Invalid token");
		});
	});
}); 