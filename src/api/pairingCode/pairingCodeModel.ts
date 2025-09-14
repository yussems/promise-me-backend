// models/PairingCode.ts
import { model, Schema, type Types } from "mongoose";
import z from "zod";

export interface IPairingCode {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	codeHash: string;
	used: boolean;
	usedAt?: Date;
	usedBy?: Types.ObjectId;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const PairingCodeSchema = new Schema<IPairingCode>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		codeHash: { type: String, required: true, unique: true, index: true },
		used: { type: Boolean, default: false, index: true },
		usedAt: { type: Date },
		usedBy: { type: Schema.Types.ObjectId, ref: "User" },
		expiresAt: { type: Date, required: true, index: true },
	},
	{ timestamps: true },
);

// TTL: expiresAt geçtiğinde otomatik silinsin
PairingCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PairingCode = model<IPairingCode>("PairingCode", PairingCodeSchema);

export const createPairingCodeSchema = z.object({
	userId: z.string(),
	codeHash: z.string(),
	used: z.boolean(),
	usedAt: z.date().optional(),
	usedBy: z.string().optional(),
	expiresAt: z.date(),
});
