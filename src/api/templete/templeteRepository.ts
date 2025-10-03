import { default as TemplateModel } from "@/api/templete/templeteModel";

export interface TemplateData {
	_id: string;
	name: string;
	description?: string;
	sku: string;
	price: number;
	currency: string;
	previewUrl?: string;
	filePath?: string;
	tags: string[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// MongoDB için ObjectId kullanan interface
export interface MongoTemplateData {
	_id?: string;
	name: string;
	description?: string;
	sku: string;
	price: number;
	currency: string;
	previewUrl?: string;
	filePath?: string;
	tags: string[];
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export class TempleteRepository {
	// 1. CRUD (temel) operasyonları

	async findAllAsync(): Promise<TemplateData[]> {
		try {
			const templates = await TemplateModel.find({ isActive: true }).sort({ createdAt: -1 });
			return templates.map((template) => this.mapToTemplate(template));
		} catch (error) {
			throw new Error(`Failed to fetch templates: ${(error as Error).message}`);
		}
	}

	// Helper method to map MongoDB document to Template interface
	private mapToTemplate(templateDoc: any): TemplateData {
		return {
			_id: templateDoc._id.toString(),
			name: templateDoc.name,
			description: templateDoc.description,
			sku: templateDoc.sku,
			price: templateDoc.price,
			currency: templateDoc.currency,
			previewUrl: templateDoc.previewUrl,
			filePath: templateDoc.filePath,
			tags: templateDoc.tags || [],
			isActive: templateDoc.isActive,
			createdAt: templateDoc.createdAt,
			updatedAt: templateDoc.updatedAt,
		};
	}
}
