import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { mongoConnection } from "@/common/database/mongoConnection";

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
	method: "get",
	path: "/health-check",
	tags: ["Health Check"],
	responses: createApiResponse(z.null(), "Success"),
});

healthCheckRouter.get("/", async (_req: Request, res: Response) => {
	try {
		const isMongoConnected = mongoConnection.getConnectionStatus();
		
		if (!isMongoConnected) {
			const serviceResponse = ServiceResponse.failure("Service is unhealthy - MongoDB not connected", null, 503);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}

		const serviceResponse = ServiceResponse.success("Service is healthy", {
			status: "healthy",
			timestamp: new Date().toISOString(),
			database: "connected"
		});
		res.status(serviceResponse.statusCode).send(serviceResponse);
	} catch (error) {
		const serviceResponse = ServiceResponse.failure("Service is unhealthy", null, 503);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	}
});
