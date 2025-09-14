import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { pairingCodeController } from "./pairingCodeController";

export const pairingCodeRouter: Router = express.Router();

pairingCodeRouter.post("/", authenticateToken, pairingCodeController.createPairingCode);

pairingCodeRouter.get("/mine", authenticateToken, pairingCodeController.findMinePairingCode);
