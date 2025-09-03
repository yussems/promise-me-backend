import type { Request, RequestHandler, Response } from "express";
import { promisesService } from "./promisesService";

class PromisesController {
  public getPromises: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await promisesService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getPromise: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serviceResponse = await promisesService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public createPromise: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const promiseData = req.body;
    console.log("Received promise data:", promiseData);

    const serviceResponse = await promisesService.createPromise(promiseData);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public updatePromise: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id as string;
    const promiseData = req.body;
    const serviceResponse = await promisesService.update(id, promiseData);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public deletePromise: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id as string;
    const serviceResponse = await promisesService.delete(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getPromisesByOwner: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const ownerId = req.params.ownerId as string;
    const serviceResponse = await promisesService.findByOwnerId(ownerId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getPromiseCount: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await promisesService.getCount();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const promisesController = new PromisesController();
