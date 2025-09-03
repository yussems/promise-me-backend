import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { LoginSchema, RegisterSchema, RefreshTokenSchema, LogoutSchema, AuthSchema } from "./authModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("Auth", AuthSchema);

// POST /auth/register - Register new user
authRegistry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Auth"],
	request: { 
		body: {
			content: {
				"application/json": {
					schema: RegisterSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(AuthSchema, "Success", 201),
});

authRouter.post("/register", authController.register);

// POST /auth/login - User login
authRegistry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Auth"],
	request: { 
		body: {
			content: {
				"application/json": {
					schema: LoginSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(z.object({
		user: AuthSchema,
		tokens: z.object({
			accessToken: z.string(),
			refreshToken: z.string(),
		}),
	}), "Success"),
});

authRouter.post("/login", authController.login);

// POST /auth/refresh - Refresh token
authRegistry.registerPath({
	method: "post",
	path: "/auth/refresh",
	tags: ["Auth"],
	request: { 
		body: {
			content: {
				"application/json": {
					schema: RefreshTokenSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}), "Success"),
});

authRouter.post("/refresh", authController.refreshToken);

// POST /auth/logout - User logout
authRegistry.registerPath({
	method: "post",
	path: "/auth/logout",
	tags: ["Auth"],
	request: { 
		body: {
			content: {
				"application/json": {
					schema: LogoutSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(z.null(), "Success"),
});

authRouter.post("/logout", authController.logout);

// GET /auth/verify - Verify token
authRegistry.registerPath({
	method: "get",
	path: "/auth/verify",
	tags: ["Auth"],
	responses: createApiResponse(z.object({
		userId: z.string(),
	}), "Success"),
});

authRouter.get("/verify", authController.verifyToken); 