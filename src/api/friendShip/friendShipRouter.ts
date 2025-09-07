import express, { type Router } from "express";
import { friendshipController } from "./friendShipController";

export const friendShipRouter: Router = express.Router();

friendShipRouter.get("/", friendshipController.getFriends);
