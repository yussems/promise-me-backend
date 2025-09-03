import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

extendZodWithOpenApi(z);

export interface IPromises extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  body?: string;
  dueAtUtc?: Date;
  parties?: string[];
  status?: "open" | "resolved" | "cancelled";
}

const promisesSchema = new Schema<IPromises>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String },
    dueAtUtc: { type: Date, index: true },
    parties: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    status: {
      type: String,
      enum: ["open", "resolved", "cancelled"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

export const PromisesModel = mongoose.model<IPromises>(
  "Promises",
  promisesSchema
);

export type Promises = z.infer<typeof PromisesSchema>;

export const PromisesSchema = z.object({
  ownerId: z.string(),
  title: z.string().min(2).max(100),
  body: z.string().max(1000).optional(),
  dueAtUtc: z.string().datetime().optional(), // ✅ String datetime
  parties: z.array(z.string()).optional(), // ✅ Optional yapıldı
  status: z.enum(["open", "resolved", "cancelled"]).optional(),
});

export const createPromisesSchema = z.object({
  body: PromisesSchema,
});
