import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createUserSchema, UserSchemaZod } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchemaZod);

// GET /users - Get all users
userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchemaZod), "Success"),
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
// You need to define getUserSchema for params validation
const getUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: getUserSchema.shape.params },
  responses: createApiResponse(UserSchemaZod, "Success"),
});

userRouter.get("/:id", validateRequest(getUserSchema), userController.getUser);

// POST /users - Create new user
userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(UserSchemaZod, "Success", 201),
});

userRouter.post(
  "/",
  validateRequest(createUserSchema),
  userController.createUser
);

// PUT /users/{id} - Update user
// You need to define updateUserSchema for params and body validation
const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: UserSchemaZod,
});
userRegistry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["User"],
  request: {
    params: updateUserSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(UserSchemaZod, "Success"),
});

userRouter.put(
  "/:id",
  validateRequest(updateUserSchema),
  userController.updateUser
);

// DELETE /users/{id} - Delete user
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: getUserSchema.shape.params },
  responses: createApiResponse(z.boolean(), "Success"),
});

userRouter.delete(
  "/:id",
  validateRequest(getUserSchema),
  userController.deleteUser
);
