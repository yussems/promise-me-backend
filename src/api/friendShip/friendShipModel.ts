import { model, Schema, type Types } from "mongoose";
import type { IUser } from "@/api/user/userModel";

export interface IFriendship {
	_id: Types.ObjectId;
	userIdOne: Types.ObjectId; // küçük olan
	userIdTwo: Types.ObjectId; // büyük olan
	since: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Populate edilmiş versiyonu için
export interface IFriendshipPopulated {
	_id: Types.ObjectId;
	userIdOne: IUser;
	userIdTwo: IUser;
	since: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Friend listesi için sadece gerekli alanlar
export interface FriendSummary {
	_id: string;
	name: string;
	displayName?: string;
	avatarUrl?: string;
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
