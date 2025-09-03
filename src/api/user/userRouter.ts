import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { GetUserSchema, UserSchema, CreateUserSchema, UpdateUserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// GET /users - Get all users
userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", authenticateToken, userController.getUsers);

// GET /users/count - Get user count
userRegistry.registerPath({
	method: "get",
	path: "/users/count",
	tags: ["User"],
	responses: createApiResponse(z.number(), "Success"),
});

userRouter.get("/count", userController.getUserCount);

// GET /users/{id} - Get user by ID
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

// POST /users - Create new user
userRegistry.registerPath({
	method: "post",
	path: "/users",
	tags: ["User"],
	request: { 
		body: {
			content: {
				"application/json": {
					schema: CreateUserSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(UserSchema, "Success", 201),
});

userRouter.post("/", validateRequest(CreateUserSchema), userController.createUser);

// PUT /users/{id} - Update user
userRegistry.registerPath({
	method: "put",
	path: "/users/{id}",
	tags: ["User"],
	request: { 
		params: UpdateUserSchema.shape.params,
		body: {
			content: {
				"application/json": {
					schema: UpdateUserSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.put("/:id", validateRequest(UpdateUserSchema), userController.updateUser);

// DELETE /users/{id} - Delete user
userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(z.boolean(), "Success"),
});

userRouter.delete("/:id", validateRequest(GetUserSchema), userController.deleteUser);
