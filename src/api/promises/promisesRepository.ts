import mongoose from "mongoose";
import type { PromiseStatus, PromiseType } from "@/api/promises/promisesModel";
import { default as PromiseModel } from "@/api/promises/promisesModel";

export interface PromiseData {
	_id: string;
	type: PromiseType;
	title: string;
	description?: string;
	status: PromiseStatus;
	seriousness: "playful" | "normal" | "serious";
	participants: Array<{
		userId: string;
		role: "creator" | "counterparty" | "member";
		acceptedAt?: Date;
		signature?: {
			method: "tap-accept" | "drawn" | "typed" | "pin";
			data?: string;
		};
	}>;
	visibility: "private" | "friends" | "link";
	shareCode?: string;
	conditions: Array<{
		_id: string;
		label: string;
		type: "time" | "action" | "proof";
		rule: {
			deadlineAt?: Date;
			actionKey?: string;
			requiresEvidence: boolean;
		};
		consequence: {
			kind: "penalty" | "reward" | "forfeit" | "none";
			text?: string;
		};
		isMet: boolean;
		metAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	}>;
	evidences: Array<{
		_id: string;
		byUserId: string;
		kind: "photo" | "video" | "text" | "file" | "link";
		url?: string;
		text?: string;
		hash?: string;
		createdAt: Date;
		updatedAt: Date;
	}>;
	timezone: string;
	startAt?: Date;
	dueAt?: Date;
	autoBreach: {
		enabled: boolean;
		graceMinutes: number;
	};
	receipts: Array<{
		_id: string;
		at: Date;
		actorId?: string;
		action: string;
		meta?: Record<string, unknown>;
	}>;
	preferredView: "declaration" | "card" | "timeline" | "receipt" | "minimal";
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

// MongoDB için ObjectId kullanan interface
export interface MongoPromiseData {
	_id?: string;
	type: PromiseType;
	title: string;
	description?: string;
	status: PromiseStatus;
	seriousness: "playful" | "normal" | "serious";
	participants: Array<{
		userId: mongoose.Types.ObjectId;
		role: "creator" | "counterparty" | "member";
		acceptedAt?: Date;
		signature?: {
			method: "tap-accept" | "drawn" | "typed" | "pin";
			data?: string;
		};
	}>;
	visibility: "private" | "friends" | "link";
	shareCode?: string;
	conditions: Array<{
		_id?: string;
		label: string;
		type: "time" | "action" | "proof";
		rule: {
			deadlineAt?: Date;
			actionKey?: string;
			requiresEvidence: boolean;
		};
		consequence: {
			kind: "penalty" | "reward" | "forfeit" | "none";
			text?: string;
		};
		isMet: boolean;
		metAt?: Date;
		createdAt?: Date;
		updatedAt?: Date;
	}>;
	timezone: string;
	startAt?: Date;
	dueAt?: Date;
	autoBreach: {
		enabled: boolean;
		graceMinutes: number;
	};
	preferredView: "declaration" | "card" | "timeline" | "receipt" | "minimal";
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}

export class PromisesRepository {
	// 1. CRUD (temel) operasyonları

	async createAsync(promiseData: MongoPromiseData): Promise<PromiseData> {
		try {
			const newPromise = new PromiseModel(promiseData);
			const savedPromise = await newPromise.save();
			return this.mapToPromise(savedPromise);
		} catch (error) {
			throw new Error(`Failed to create promise: ${(error as Error).message}`);
		}
	}

	async findByIdAsync(id: string): Promise<PromiseData | null> {
		try {
			const promise = await PromiseModel.findById(id)
				.where({ deletedAt: { $exists: false } })
				.populate("participants.userId");
			return promise ? this.mapToPromise(promise) : null;
		} catch (error) {
			throw new Error(`Failed to fetch promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async findByUserIdAsync(userId: string): Promise<PromiseData[]> {
		try {
			const query: Record<string, unknown> = {
				"participants.userId": new mongoose.Types.ObjectId(userId),
				deletedAt: { $exists: false },
			};
			const promises = await PromiseModel.find(query).sort({ updatedAt: -1 });
			return promises.map((promise) => this.mapToPromise(promise));
		} catch (error) {
			throw new Error(`Failed to fetch promises for user ${userId}: ${(error as Error).message}`);
		}
	}

	async updateAsync(
		id: string,
		promiseData: Partial<Omit<PromiseData, "_id" | "createdAt" | "updatedAt" | "deletedAt">>,
	): Promise<PromiseData | null> {
		try {
			// Convert string userIds to ObjectIds if they exist in the update data
			const updateData: Record<string, unknown> = { ...promiseData, updatedAt: new Date() };

			if (updateData.participants) {
				updateData.participants = (updateData.participants as Array<unknown>).map((p: any) => ({
					...p,
					userId: new mongoose.Types.ObjectId(p.userId),
				}));
			}

			if (updateData.evidences) {
				updateData.evidences = (updateData.evidences as Array<unknown>).map((e: any) => ({
					...e,
					byUserId: new mongoose.Types.ObjectId(e.byUserId),
				}));
			}

			if (updateData.receipts) {
				updateData.receipts = (updateData.receipts as Array<unknown>).map((r: any) => ({
					...r,
					actorId: r.actorId ? new mongoose.Types.ObjectId(r.actorId) : undefined,
				}));
			}

			const updatedPromise = await PromiseModel.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
			}).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to update promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async softDeleteAsync(id: string): Promise<boolean> {
		try {
			const result = await PromiseModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).where({
				deletedAt: { $exists: false },
			});

			return !!result;
		} catch (error) {
			throw new Error(`Failed to soft delete promise with id ${id}: ${(error as Error).message}`);
		}
	}

	// Helper method to map MongoDB document to Promise interface
	private mapToPromise(promiseDoc: any): PromiseData {
		return {
			_id: promiseDoc._id.toString(),
			type: promiseDoc.type,
			title: promiseDoc.title,
			description: promiseDoc.description,
			status: promiseDoc.status,
			seriousness: promiseDoc.seriousness,
			participants: promiseDoc.participants.map((p: any) => ({
				userId: p.userId.toString(),
				role: p.role,
				acceptedAt: p.acceptedAt,
				signature: p.signature,
			})),
			visibility: promiseDoc.visibility,
			shareCode: promiseDoc.shareCode,
			conditions: promiseDoc.conditions.map((c: any) => ({
				_id: c._id.toString(),
				label: c.label,
				type: c.type,
				rule: c.rule,
				consequence: c.consequence,
				isMet: c.isMet,
				metAt: c.metAt,
				createdAt: c.createdAt,
				updatedAt: c.updatedAt,
			})),
			evidences: promiseDoc.evidences.map((e: any) => ({
				_id: e._id.toString(),
				byUserId: e.byUserId.toString(),
				kind: e.kind,
				url: e.url,
				text: e.text,
				hash: e.hash,
				createdAt: e.createdAt,
				updatedAt: e.updatedAt,
			})),
			timezone: promiseDoc.timezone,
			startAt: promiseDoc.startAt,
			dueAt: promiseDoc.dueAt,
			autoBreach: promiseDoc.autoBreach,
			receipts: promiseDoc.receipts.map((r: any) => ({
				_id: r._id.toString(),
				at: r.at,
				actorId: r.actorId?.toString(),
				action: r.action,
				meta: r.meta,
			})),
			preferredView: promiseDoc.preferredView,
			createdAt: promiseDoc.createdAt,
			updatedAt: promiseDoc.updatedAt,
			deletedAt: promiseDoc.deletedAt,
		};
	}
}
