import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./authService";
import { LoginSchema, RegisterSchema, RefreshTokenSchema, LogoutSchema } from "./authModel";

class AuthController {
	public register: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { email, password, confirmPassword } = RegisterSchema.parse(req).body;
			const result = await AuthService.register(email, password);
			res.status(result.statusCode).send(result);
		} catch (error) {
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
			const result = await AuthService.login(email, password);
			res.status(result.statusCode).send(result);
		} catch (error) {
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
			const result = await AuthService.refreshToken(refreshToken);
			res.status(result.statusCode).send(result);
		} catch (error) {
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
			const result = await AuthService.logout(refreshToken);
			res.status(result.statusCode).send(result);
		} catch (error) {
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
		const result = await AuthService.verifyToken(token);
		res.status(result.statusCode).send(result);
	};
}

export const authController = new AuthController(); 