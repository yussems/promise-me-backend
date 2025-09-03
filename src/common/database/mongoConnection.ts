import mongoose from "mongoose";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

class MongoConnection {
	private static instance: MongoConnection;
	private isConnected = false;

	private constructor() {}

	public static getInstance(): MongoConnection {
		if (!MongoConnection.instance) {
			MongoConnection.instance = new MongoConnection();
		}
		return MongoConnection.instance;
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			logger.info("MongoDB is already connected");
			return;
		}

		try {
			// MongoDB connection options
			const options = {
				dbName: env.MONGODB_DB_NAME,
				maxPoolSize: 10,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
			};

			await mongoose.connect(env.MONGODB_URI, options);
			this.isConnected = true;
			logger.info("MongoDB connected successfully");
		} catch (error) {
			logger.error("MongoDB connection error:", error);
			throw error;
		}
	}

	public async disconnect(): Promise<void> {
		if (!this.isConnected) {
			logger.info("MongoDB is not connected");
			return;
		}

		try {
			await mongoose.disconnect();
			this.isConnected = false;
			logger.info("MongoDB disconnected successfully");
		} catch (error) {
			logger.error("MongoDB disconnection error:", error);
			throw error;
		}
	}

	public getConnectionStatus(): boolean {
		return this.isConnected;
	}

	public getMongooseConnection(): typeof mongoose {
		return mongoose;
	}
}

export const mongoConnection = MongoConnection.getInstance(); 