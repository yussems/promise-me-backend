import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { generateRandomName } from "@/common/utils/displayName";
import { generateUniqueFriendCode } from "@/common/utils/friendCode";
import { userService } from "../user/userService";
import { LoginSchema, LogoutSchema, RefreshTokenSchema, RegisterSchema } from "./authModel";
import { authService } from "./authService";

class AuthController {
	public register: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { email, password } = RegisterSchema.parse(req).body;

			// Register user
			const registerResult = await authService.register(email, password);

			if (!registerResult.success) {
				return res.status(registerResult.statusCode).send(registerResult);
			}

			// Create user profile
			await userService.createUser({
				authId: String(registerResult.responseObject._id),
				friendCode: await generateUniqueFriendCode(),
				friendCodeEnabled: true,
				friendAutoAccept: false,
				displayName: generateRandomName(),
			});

			// Auto login after registration
			const loginResult = await authService.login(email, password);

			res.status(loginResult.statusCode).send(loginResult);
		} catch {
			res.status(StatusCodes.BAD_REQUEST).send({
				success: false,
				message: "Invalid input data",
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}
	};

	public login: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { email, password } = LoginSchema.parse(req).body;
			const result = await authService.login(email, password);
			console.log(result, "result, login");

			res.status(result.statusCode).send(result);
		} catch {
			res.status(StatusCodes.BAD_REQUEST).send({
				success: false,
				message: "Invalid input data",
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}
	};

	public refreshToken: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { refreshToken } = RefreshTokenSchema.parse(req).body;
			const result = await authService.refreshToken(refreshToken);
			res.status(result.statusCode).send(result);
		} catch {
			res.status(StatusCodes.BAD_REQUEST).send({
				success: false,
				message: "Invalid input data",
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}
	};

	public logout: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { refreshToken } = LogoutSchema.parse(req).body;
			const result = await authService.logout(refreshToken);
			res.status(result.statusCode).send(result);
		} catch {
			res.status(StatusCodes.BAD_REQUEST).send({
				success: false,
				message: "Invalid input data",
				responseObject: null,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		}
	};

	public verifyToken: RequestHandler = async (req: Request, res: Response) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(StatusCodes.UNAUTHORIZED).send({
				success: false,
				message: "No token provided",
				responseObject: null,
				statusCode: StatusCodes.UNAUTHORIZED,
			});
		}

		const token = authHeader.substring(7); // Remove "Bearer " prefix
		const result = await authService.verifyToken(token);
		res.status(result.statusCode).send(result);
	};

	public getMe: RequestHandler = async (req: Request, res: Response) => {
		try {
			const authId = req.user?.authId;

			if (!authId) {
				return res.status(StatusCodes.UNAUTHORIZED).send({
					success: false,
					message: "User not authenticated",
					responseObject: null,
					statusCode: StatusCodes.UNAUTHORIZED,
				});
			}

			const result = await userService.findByAuthId(authId);
			res.status(result.statusCode).send(result);
		} catch {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
				success: false,
				message: "Internal server error",
				responseObject: null,
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	};
}

export const authController = new AuthController();
