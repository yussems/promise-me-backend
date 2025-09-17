import { model, Schema, type Types } from "mongoose";

export interface IFriendship {
	_id: Types.ObjectId;
	userIdOne: Types.ObjectId; // küçük olan
	userIdTwo: Types.ObjectId; // büyük olan
	since: Date;
	createdAt: Date;
	updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
	{
		userIdOne: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		userIdTwo: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		since: { type: Date, default: () => new Date() },
	},
	{ timestamps: true },
);

FriendshipSchema.index({ userIdOne: 1, userIdTwo: 1 }, { unique: true });

export const FriendshipModel = model<IFriendship>("Friendship", FriendshipSchema);
