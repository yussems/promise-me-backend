import { Schema, model, Types } from "mongoose";

export interface IFriendship {
  _id: Types.ObjectId;
  authIdOne: Types.ObjectId; // küçük olan
  authIdTwo: Types.ObjectId; // büyük olan
  since: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    authIdOne: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    authIdTwo: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    since: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

FriendshipSchema.index({ userId1: 1, userId2: 1 }, { unique: true });

export const FriendshipModel = model<IFriendship>(
  "Friendship",
  FriendshipSchema
);
