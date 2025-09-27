import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { fileService } from "./fileService";

class FileController {
	// Empty controller class - no functions implemented
	async downloadFile(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const result = await fileService.getFileStream(id);
			if (!result) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ServiceResponse.failure("File not found", null, StatusCodes.NOT_FOUND));
			}

			res.setHeader("Content-Type", result.file.contentType || "application/octet-stream");

			(result.body as any).pipe(res);
		} catch (err) {
			console.error("Download error:", err);
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json(ServiceResponse.failure("Failed to download file", null, StatusCodes.INTERNAL_SERVER_ERROR));
		}
	}
}

export const fileController = new FileController();
