// models/Promise.ts
import { model, Schema, type Types } from "mongoose";
import { z } from "zod";

export type PromiseType =
	| "promise" // karşılıklı anlaşma
	| "bet" // iddia/bahis
	| "oath" // tek taraflı yemin
	| "declaration" // bildirge
	| "pact" // grup paktı
	| "challenge"; // meydan okuma

export type PromiseStatus = "draft" | "proposed" | "active" | "fulfilled" | "breached" | "cancelled" | "published"; // bildirge/tek taraflı tipler için

const ConditionSchema = new Schema(
	{
		title: String,
		description: String,
	},
	{ timestamps: true },
);

const EvidenceSchema = new Schema(
	{
		byUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		kind: { type: String, enum: ["photo", "video", "text", "file", "link"], required: true },
		url: String,
		text: String,
		hash: String,
		conditionId: { type: Schema.Types.ObjectId },
	},
	{ timestamps: true },
);

const ReceiptSchema = new Schema({
	at: { type: Date, default: Date.now },
	actorId: { type: Schema.Types.ObjectId, ref: "User" },
	action: String,
	meta: Schema.Types.Mixed,
});

interface IParticipant {
	userId: Types.ObjectId;
	acceptedAt?: Date;
	side: {
		index: number;
		title: string;
	};
	status: "pending" | "accepted" | "rejected";
	signature?: {
		method: "tap-accept" | "drawn" | "typed" | "pin";
		data?: string;
	};
}

const ParticipantSchema = new Schema<IParticipant>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	acceptedAt: Date,
	side: {
		index: { type: Number, required: true },
		title: { type: String, required: true },
	},
	status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
	signature: {
		method: { type: String, enum: ["tap-accept", "drawn", "typed", "pin"], default: "tap-accept" },
		data: String,
	},
});

const PromiseSchema = new Schema(
	{
		type: { type: String, enum: ["promise", "bet", "oath", "declaration", "pact", "challenge"], default: "promise" },
		title: { type: String, required: true },
		description: String,
		status: {
			type: String,
			enum: ["draft", "proposed", "active", "fulfilled", "breached", "cancelled", "published"],
			default: "draft",
		},
		seriousness: { type: String, enum: ["playful", "normal", "serious"], default: "normal" },
		sides: {
			type: [
				{
					title: String,
					index: Number,
				},
			],
			default: [],
		}, // Taraf listesi
		participants: { type: [ParticipantSchema], validate: (v: IParticipant[]) => v.length >= 1 },
		visibility: { type: String, enum: ["private", "friends", "link"], default: "link" },
		shareCode: { type: String, index: true, unique: true },

		conditions: [ConditionSchema],
		evidences: [EvidenceSchema],

		timezone: { type: String, default: "Europe/Istanbul" },
		startAt: Date,
		dueAt: Date,

		autoBreach: {
			enabled: { type: Boolean, default: true },
			graceMinutes: { type: Number, default: 60 },
		},

		receipts: [ReceiptSchema],

		// ek: hangi şablonda gösterileceği
		preferredView: {
			type: String,
			enum: ["declaration", "card", "timeline", "receipt", "minimal", "default"],
			default: "default",
		},
	},
	{ timestamps: true },
);

PromiseSchema.index({ "participants.userId": 1, status: 1, dueAt: 1 });
export default model("Promise", PromiseSchema);

// Zod validation schemas
export const createPromiseSchema = z.object({
	body: z
		.object({
			type: z.enum(["promise", "bet", "oath", "declaration", "pact", "challenge"]).default("promise"),
			title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
			description: z.string().optional(),

			side: z.array(z.string()),
			participants: z
				.array(
					z.object({
						userId: z.string().min(1, "User ID is required"),
						acceptedAt: z.string().datetime().optional(),
						signature: z
							.object({
								method: z.enum(["tap-accept", "drawn", "typed", "pin"]).default("tap-accept"),
								data: z.string().optional(),
							})
							.optional(),
					}),
				)
				.min(1, "At least one participant is required")
				.max(10, "Maximum 10 participants allowed"),
			conditions: z
				.array(
					z.object({
						label: z.string().min(1, "Condition label is required"),
						type: z.enum(["time", "action", "proof"]),
						rule: z.object({
							deadlineAt: z.string().datetime().optional(),
							requiresEvidence: z.boolean().default(false),
						}),
						consequence: z.object({
							kind: z.enum(["penalty", "reward", "forfeit", "none"]).default("none"),
							text: z.string().optional(),
						}),
						isMet: z.boolean().default(false),
						metAt: z.string().datetime().optional(),
					}),
				)
				.default([]),

			timezone: z.string().default("Europe/Istanbul"),
			startAt: z.string().datetime().optional(),
			dueAt: z.string().datetime().optional(),
			autoBreach: z
				.object({
					enabled: z.boolean().default(true),
					graceMinutes: z.number().min(0).default(60),
				})
				.default({ enabled: true, graceMinutes: 60 }),

			preferredView: z.enum(["declaration", "card", "timeline", "receipt", "minimal", "default"]).default("default"),
		})
		.superRefine((d, ctx) => {
			// dueAt > startAt
			if (d.dueAt && d.startAt && new Date(d.dueAt) <= new Date(d.startAt)) {
				ctx.addIssue({ code: "custom", path: ["dueAt"], message: "Due must be after start" });
			}
			// type'a göre min katılımcı
			const needTwo = ["promise", "bet", "challenge", "pact"].includes(d.type);
			if (needTwo && d.participants.length < 2) {
				ctx.addIssue({ code: "custom", path: ["participants"], message: "At least 2 participants required" });
			}
			// tek ve yalnız 1 creator

			// duplicate userId
			const ids = d.participants.map((p) => p.userId.trim());
			if (new Set(ids).size !== ids.length) {
				ctx.addIssue({ code: "custom", path: ["participants"], message: "Duplicate participants not allowed" });
			}
		}),
});
