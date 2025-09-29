import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import mongoose, { Schema, type Types } from "mongoose";
import z from "zod";

export type FriendCodePrivacy = "anyone" | "friendsOfFriends" | "off";
extendZodWithOpenApi(z);

export interface IUser {
	_id: Types.ObjectId;
	authId: Types.ObjectId; // Auth sistemi ile ilişkilendirmek için (ör: Auth0 user ID)
	// Auth ile ayrı tutacaksan email burada zorunlu olmayabilir.
	name: string;
	email?: string;
	displayName?: string;
	avatarUrl?: string;

	// Kalıcı kod (Steam tarzı) — DB'de normalize (A-Z0-9, no dashes)
	friendCode?: string; // ör: "7K2Q9M4DX8JH3PQA" (16-20 hane arası)
	friendCodeEnabled: boolean;
	friendCodePrivacy: FriendCodePrivacy;
	friendAutoAccept: boolean;
	profileNamePreference?: "name" | "displayName";

	createdAt: Date;
	updatedAt: Date;
}
const userSchema = new Schema<IUser>(
	{
		authId: {
			type: Schema.Types.ObjectId,
			ref: "Auth",
			required: true,
			index: true,
			unique: true,
		},
		name: { type: String, default: null },
		displayName: { type: String },
		avatarUrl: { type: String, default: null },
		friendCode: { type: String, index: true, unique: true, sparse: true }, // normalize: A-Z0-9
		friendCodeEnabled: { type: Boolean, default: true },
		profileNamePreference: { type: String, enum: ["name", "displayName"], default: "displayName" },
		friendCodePrivacy: {
			type: String,
			enum: ["anyone", "friendsOfFriends", "off"],
			default: "anyone",
		},
		friendAutoAccept: { type: Boolean, default: false },
	},
	{ timestamps: true },
);
export const UserModel = mongoose.model<IUser>("User", userSchema);

export type User = z.infer<typeof UserSchemaZod>;

export const UserSchemaZod = z.object({
	_id: z.string(),
	authId: z.string(),
	name: z.string().max(100).optional(),
	displayName: z.string().max(100).optional(),
	avatarUrl: z.string().url().optional(),
	friendCode: z
		.string()
		.min(16)
		.max(20)
		.regex(/^[A-Z0-9]+$/)
		.optional(),
	friendCodeEnabled: z.boolean().default(true).optional(),
	friendCodePrivacy: z.enum(["anyone", "friendsOfFriends", "off"]).default("anyone").optional(),
	friendAutoAccept: z.boolean().default(false).optional(),
});
export const createUserSchema = z.object({
	body: UserSchemaZod,
});
