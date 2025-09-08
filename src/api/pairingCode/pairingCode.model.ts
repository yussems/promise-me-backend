// models/PairingCode.ts
import { Schema, model, Types } from "mongoose";

export interface IPairingCode {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
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
    ownerId: {
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
  { timestamps: true }
);

// TTL: expiresAt geçtiğinde otomatik silinsin
PairingCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PairingCode = model<IPairingCode>(
  "PairingCode",
  PairingCodeSchema
);
