import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { s3 } from "@/common/utils/s3";
import { FileRepository } from "./fileRepository";

export class FileService {
	private fileRepo: FileRepository;
	private bucketName: string;

	constructor() {
		this.fileRepo = new FileRepository();
		this.bucketName = process.env.R2_BUCKET!;
	}

	async requestUpload(
		userId: string,
		filename: string,
		contentType: string,
		linkedTo?: { kind: string; itemId: string },
	) {
		const storageKey = `${linkedTo?.kind || "misc"}/${userId}/${uuid()}-${filename}`;

		const file = await this.fileRepo.createFile({
			userId,
			originalName: filename,
			storageKey,
			contentType,
			status: "completed", // ✅ confirm olmadan direkt completed
			linkedTo: linkedTo || { kind: null, itemId: null },
		});

		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: storageKey,
			ContentType: contentType,
		});

		const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
		return { file, uploadUrl };
	}
	async getFileStream(fileId: string) {
		const file = await this.fileRepo.findById(fileId);
		if (!file) return null;

		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: file.storageKey,
		});

		const object = await s3.send(command);

		return { file, body: object.Body as any };
	}
}
export const fileService = new FileService();
