import { model, Schema, type Types } from "mongoose";
import { z } from "zod";

// Empty model file - no schemas or models defined

const FileSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		originalName: { type: String, required: true },
		storageKey: { type: String, required: true, unique: true },
		contentType: { type: String },
		size: { type: Number },

		status: { type: String, enum: ["pending", "completed"], default: "pending" },

		isPublic: { type: Boolean, default: false },

		linkedTo: {
			kind: { type: String, enum: ["promise", "contract", "user", null], default: null },
			itemId: { type: Schema.Types.ObjectId, default: null },
		},
	},
	{ timestamps: true },
);

export default model("File", FileSchema);

// Empty Zod validation schemas
export const createFileSchema = z.object({
	body: z.object({
		// Empty validation schema
	}),
});
