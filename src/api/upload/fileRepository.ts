import mongoose from "mongoose";
import { default as FileModel } from "@/api/upload/fileModel";

export interface FileData {
	_id: string;
	// Empty interface - no properties defined
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

// MongoDB için ObjectId kullanan interface
export interface MongoFileData {
	_id?: string;
	// Empty interface - no properties defined
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}

export class FileRepository {
	async createFile(file: any): Promise<FileData> {
		try {
			const newFile = new FileModel(file);
			const savedFile = await newFile.save();
			return this.mapToFile(savedFile);
		} catch (error) {
			throw new Error(`Failed to create file: ${(error as Error).message}`);
		}
	}
	async findById(fileId: string) {
		return FileModel.findById(fileId);
	}

	private mapToFile(fileDoc: any): FileData {
		return {
			_id: fileDoc._id.toString(),
			createdAt: fileDoc.createdAt,
			updatedAt: fileDoc.updatedAt,
			deletedAt: fileDoc.deletedAt,
		};
	}
}
