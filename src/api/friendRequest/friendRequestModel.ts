// models/FriendRequest.ts
import { model, Schema, type Types } from "mongoose";
import z from "zod";

export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled" | "blocked";

export interface IFriendRequest {
	_id: Types.ObjectId;
	fromUserId: Types.ObjectId;
	toUserId: Types.ObjectId;
	status: FriendRequestStatus;
	createdAt: Date;
	updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
	{
		fromUserId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		toUserId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "declined", "cancelled", "blocked"],
			default: "pending",
			index: true,
		},
	},
	{ timestamps: true },
);

// Aynı ikili için tek PENDING istek
FriendRequestSchema.index(
	{ fromUserId: 1, toUserId: 1, status: 1 },
	{ unique: true, partialFilterExpression: { status: "pending" } },
);

export const FriendRequestModel = model<IFriendRequest>("FriendRequest", FriendRequestSchema);

export type FriendRequest = z.infer<typeof createFriendRequestSchema>;

export const createFriendRequestSchema = z.object({
	fromUserId: z.string(),
	toUserId: z.string(),
	status: z.string(),
});
