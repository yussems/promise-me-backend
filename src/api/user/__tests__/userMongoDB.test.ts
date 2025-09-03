import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { UserService } from "../userService";
import { UserRepository } from "../userRepository";
import { mongoConnection } from "@/common/database/mongoConnection";

describe("UserService with MongoDB", () => {
	let userService: UserService;
	let userRepository: UserRepository;

	beforeAll(async () => {
		// Connect to test database
		await mongoConnection.connect();
		userRepository = new UserRepository();
		userService = new UserService(userRepository);
	});

	afterAll(async () => {
		// Clean up and disconnect
		await mongoose.connection.dropDatabase();
		await mongoConnection.disconnect();
	});

	beforeEach(async () => {
		// Clear users collection before each test
		await mongoose.connection.collection("users").deleteMany({});
	});

	describe("create", () => {
		it("should create a new user successfully", async () => {
			const userData = {
				name: "John Doe",
				email: "john@example.com",
				age: 30,
			};

			const result = await userService.create(userData);

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({
				name: userData.name,
				email: userData.email,
				age: userData.age,
			});
			expect(result.data?.id).toBeDefined();
			expect(result.data?.createdAt).toBeDefined();
			expect(result.data?.updatedAt).toBeDefined();
		});

		it("should fail when creating user with duplicate email", async () => {
			const userData = {
				name: "John Doe",
				email: "john@example.com",
				age: 30,
			};

			// Create first user
			await userService.create(userData);

			// Try to create second user with same email
			const result = await userService.create(userData);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(409);
			expect(result.message).toContain("already exists");
		});
	});

	describe("findById", () => {
		it("should find user by ID", async () => {
			const userData = {
				name: "Jane Doe",
				email: "jane@example.com",
				age: 25,
			};

			const createdUser = await userService.create(userData);
			const userId = createdUser.data?.id;

			const result = await userService.findById(userId!);

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject(userData);
		});

		it("should return null for non-existent user", async () => {
			const result = await userService.findById("507f1f77bcf86cd799439011");

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(404);
		});
	});

	describe("findAll", () => {
		it("should return all users", async () => {
			const users = [
				{ name: "User 1", email: "user1@example.com", age: 25 },
				{ name: "User 2", email: "user2@example.com", age: 30 },
				{ name: "User 3", email: "user3@example.com", age: 35 },
			];

			// Create users
			for (const user of users) {
				await userService.create(user);
			}

			const result = await userService.findAll();

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(3);
		});

		it("should return empty array when no users exist", async () => {
			const result = await userService.findAll();

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(404);
		});
	});

	describe("update", () => {
		it("should update user successfully", async () => {
			const userData = {
				name: "Original Name",
				email: "original@example.com",
				age: 25,
			};

			const createdUser = await userService.create(userData);
			const userId = createdUser.data?.id;

			const updateData = {
				name: "Updated Name",
				age: 30,
			};

			const result = await userService.update(userId!, updateData);

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({
				...userData,
				...updateData,
			});
		});

		it("should fail when updating non-existent user", async () => {
			const result = await userService.update("507f1f77bcf86cd799439011", {
				name: "Updated Name",
			});

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(404);
		});
	});

	describe("delete", () => {
		it("should delete user successfully", async () => {
			const userData = {
				name: "Delete Me",
				email: "delete@example.com",
				age: 25,
			};

			const createdUser = await userService.create(userData);
			const userId = createdUser.data?.id;

			const result = await userService.delete(userId!);

			expect(result.success).toBe(true);
			expect(result.data).toBe(true);

			// Verify user is deleted
			const findResult = await userService.findById(userId!);
			expect(findResult.success).toBe(false);
		});

		it("should fail when deleting non-existent user", async () => {
			const result = await userService.delete("507f1f77bcf86cd799439011");

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(404);
		});
	});

	describe("getCount", () => {
		it("should return correct user count", async () => {
			const users = [
				{ name: "User 1", email: "user1@example.com", age: 25 },
				{ name: "User 2", email: "user2@example.com", age: 30 },
			];

			// Create users
			for (const user of users) {
				await userService.create(user);
			}

			const result = await userService.getCount();

			expect(result.success).toBe(true);
			expect(result.data).toBe(2);
		});

		it("should return 0 when no users exist", async () => {
			const result = await userService.getCount();

			expect(result.success).toBe(true);
			expect(result.data).toBe(0);
		});
	});
}); 