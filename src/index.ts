import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import { mongoConnection } from "@/common/database/mongoConnection";

const startServer = async () => {
	try {
		// Try to connect to MongoDB (optional)
		try {
			await mongoConnection.connect();
			logger.info("MongoDB connected successfully");
		} catch (error) {
			logger.warn(`MongoDB connection failed, running without database: ${error}`);
		}
		
		const server = app.listen(env.PORT, () => {
			const { NODE_ENV, HOST, PORT } = env;
			logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
		});

		const onCloseSignal = () => {
			logger.info("sigint received, shutting down");
			server.close(async () => {
				try {
					await mongoConnection.disconnect();
				} catch (error) {
					logger.warn(`Error disconnecting from MongoDB: ${error}`);
				}
				logger.info("server closed");
				process.exit();
			});
			setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
		};

		process.on("SIGINT", onCloseSignal);
		process.on("SIGTERM", onCloseSignal);
	} catch (error) {
		logger.error(`Failed to start server: ${error}`);
		process.exit(1);
	}
};

startServer();
