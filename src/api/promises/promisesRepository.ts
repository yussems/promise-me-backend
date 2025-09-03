import { StatusCodes } from "http-status-codes";
import { PromisesModel, type IPromises } from "./promisesModel";
import { logger } from "@/server";

export class PromisesRepository {
  async findAllAsync(): Promise<IPromises[]> {
    return await PromisesModel.find();
  }

  async findByIdAsync(id: string): Promise<IPromises | null> {
    return await PromisesModel.findById(id);
  }

  async createAsync(promiseData: Partial<IPromises>): Promise<IPromises> {
    const promise = new PromisesModel(promiseData);
    return await promise.save();
  }

  async updateAsync(
    id: string,
    promiseData: Partial<IPromises>
  ): Promise<IPromises | null> {
    return await PromisesModel.findByIdAndUpdate(id, promiseData, {
      new: true,
    });
  }

  async deleteAsync(id: string): Promise<boolean> {
    const result = await PromisesModel.findByIdAndDelete(id);
    return result !== null;
  }

  async countAsync(): Promise<number> {
    return await PromisesModel.countDocuments();
  }

  async findByOwnerIdAsync(ownerId: string): Promise<IPromises[]> {
    return await PromisesModel.find({ ownerId });
  }
}
