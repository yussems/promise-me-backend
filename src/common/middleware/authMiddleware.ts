import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService, authService } from "@/api/auth/authService";

// Extend the Request interface to include user information
declare global {
	namespace Express {
		interface Request {
			user?: {
				authId: string;
				userId: string;
			};
		}
	}
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				message: "Access token required",
				responseObject: null,
				statusCode: StatusCodes.UNAUTHORIZED,
			});
		}

		const token = authHeader.substring(7); // Remove "Bearer " prefix
		const result = await authService.verifyToken(token);

		if (!result.success) {
			return res.status(result.statusCode).json({
				success: false,
				message: result.message,
				responseObject: null,
				statusCode: result.statusCode,
			});
		}

		// Add user information to request object
		req.user = result.responseObject;
		console.log(req.user, "req.user");

		next();
	} catch (error) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			success: false,
			message: "Invalid token",
			responseObject: null,
			statusCode: StatusCodes.UNAUTHORIZED,
		});
	}
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			// Continue without authentication
			next();
			return;
		}

		const token = authHeader.substring(7);
		const result = await authService.verifyToken(token);

		if (result.success) {
			// Add user information to request object
			req.user = result.responseObject;
		}

		next();
	} catch (error) {
		// Continue without authentication on error
		next();
	}
};
