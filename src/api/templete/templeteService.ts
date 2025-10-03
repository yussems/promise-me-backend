import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { type TemplateData, TempleteRepository } from "./templeteRepository";

export class TempleteService {
	private templeteRepository: TempleteRepository;

	constructor(repository: TempleteRepository = new TempleteRepository()) {
		this.templeteRepository = repository;
	}

	async findAllTemplates(): Promise<ServiceResponse<TemplateData[] | null>> {
		try {
			const templates = await this.templeteRepository.findAllAsync();
			return ServiceResponse.success("Templates found successfully", templates);
		} catch (error) {
			console.error("Error finding templates:", error);
			return ServiceResponse.failure("Failed to find templates", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const templeteService = new TempleteService();
