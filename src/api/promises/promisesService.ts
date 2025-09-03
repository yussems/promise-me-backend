import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { PromisesRepository } from "./promisesRepository";
import { IPromises } from "./promisesModel";
import { logger } from "@/server";

export class PromisesService {
  private promisesRepository: PromisesRepository;

  constructor(repository: PromisesRepository = new PromisesRepository()) {
    this.promisesRepository = repository;
  }

  // Retrieves all promises from the database
  async findAll(): Promise<ServiceResponse<IPromises[] | null>> {
    try {
      const promises = await this.promisesRepository.findAllAsync();
      if (!promises || promises.length === 0) {
        return ServiceResponse.failure(
          "No Promises found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<IPromises[]>("Promises found", promises);
    } catch (ex) {
      const errorMessage = `Error finding all promises: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving promises.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single promise by their ID
  async findById(id: string): Promise<ServiceResponse<IPromises | null>> {
    try {
      const promise = await this.promisesRepository.findByIdAsync(id);
      if (!promise) {
        return ServiceResponse.failure(
          "Promise not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<IPromises>("Promise found", promise);
    } catch (ex) {
      const errorMessage = `Error finding promise with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding promise.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Creates a new promise
  async createPromise(
    promiseData: Partial<IPromises>
  ): Promise<ServiceResponse<IPromises | null>> {
    try {
      const newPromise = await this.promisesRepository.createAsync(promiseData);
      return ServiceResponse.success<IPromises>(
        "Promise created successfully",
        newPromise,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating promise: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating promise.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Updates an existing promise
  async update(
    id: string,
    promiseData: Partial<IPromises>
  ): Promise<ServiceResponse<IPromises | null>> {
    try {
      // Check if promise exists
      const existingPromise = await this.promisesRepository.findByIdAsync(id);
      if (!existingPromise) {
        return ServiceResponse.failure(
          "Promise not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const updatedPromise = await this.promisesRepository.updateAsync(
        id,
        promiseData
      );
      if (!updatedPromise) {
        return ServiceResponse.failure(
          "Failed to update promise",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      return ServiceResponse.success<IPromises>(
        "Promise updated successfully",
        updatedPromise
      );
    } catch (ex) {
      const errorMessage = `Error updating promise with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating promise.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Deletes a promise
  async delete(id: string): Promise<ServiceResponse<boolean | null>> {
    try {
      // Check if promise exists
      const existingPromise = await this.promisesRepository.findByIdAsync(id);
      if (!existingPromise) {
        return ServiceResponse.failure(
          "Promise not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const deleted = await this.promisesRepository.deleteAsync(id);
      if (!deleted) {
        return ServiceResponse.failure(
          "Failed to delete promise",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      return ServiceResponse.success<boolean>(
        "Promise deleted successfully",
        true
      );
    } catch (ex) {
      const errorMessage = `Error deleting promise with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting promise.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get promises by owner ID
  async findByOwnerId(
    ownerId: string
  ): Promise<ServiceResponse<IPromises[] | null>> {
    try {
      const promises = await this.promisesRepository.findByOwnerIdAsync(
        ownerId
      );
      return ServiceResponse.success<IPromises[]>(
        "Promises found for owner",
        promises
      );
    } catch (ex) {
      const errorMessage = `Error finding promises for owner ${ownerId}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding promises.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get promise count
  async getCount(): Promise<ServiceResponse<number | null>> {
    try {
      const count = await this.promisesRepository.countAsync();
      return ServiceResponse.success<number>("Promise count retrieved", count);
    } catch (ex) {
      const errorMessage = `Error getting promise count: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while getting promise count.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const promisesService = new PromisesService();
