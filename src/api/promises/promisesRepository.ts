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
			const promise = await PromiseModel.findById(id).where({ deletedAt: { $exists: false } });
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

	// 2. Akış (status değişimleri) operasyonları

	async sendAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "proposed",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "sent",
							meta: { from: "draft", to: "proposed" },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to send promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async acceptAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "active",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "accepted",
							meta: { from: "proposed", to: "active" },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to accept promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async cancelAsync(id: string, actorId: string, reason?: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "cancelled",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "cancelled",
							meta: { reason },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to cancel promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async fulfillAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "fulfilled",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "fulfilled",
							meta: { from: "active", to: "fulfilled" },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to fulfill promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async declareBreachAsync(id: string, actorId: string, reason?: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "breached",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "breach_declared",
							meta: { reason },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to declare breach for promise with id ${id}: ${(error as Error).message}`);
		}
	}

	async publishAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "published",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "published",
							meta: { from: "draft", to: "published" },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to publish promise with id ${id}: ${(error as Error).message}`);
		}
	}

	// 3. Koşullar & kanıt operasyonları

	async markConditionMetAsync(id: string, conditionId: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findOneAndUpdate(
				{
					_id: id,
					"conditions._id": conditionId,
					deletedAt: { $exists: false },
				},
				{
					$set: {
						"conditions.$.isMet": true,
						"conditions.$.metAt": new Date(),
					},
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "condition_met",
							meta: { conditionId },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			);

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(
				`Failed to mark condition as met for promise ${id}, condition ${conditionId}: ${(error as Error).message}`,
			);
		}
	}

	async addEvidenceAsync(
		id: string,
		evidence: {
			byUserId: string;
			kind: "photo" | "video" | "text" | "file" | "link";
			url?: string;
			text?: string;
			hash?: string;
		},
	): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					$push: {
						evidences: {
							...evidence,
							byUserId: new mongoose.Types.ObjectId(evidence.byUserId),
						},
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(evidence.byUserId),
							action: "evidence_added",
							meta: { evidenceKind: evidence.kind },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to add evidence to promise ${id}: ${(error as Error).message}`);
		}
	}

	async removeEvidenceAsync(id: string, evidenceId: string, actorId: string): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					$pull: { evidences: { _id: evidenceId } },
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "evidence_removed",
							meta: { evidenceId },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to remove evidence from promise ${id}: ${(error as Error).message}`);
		}
	}

	// 4. Bet / challenge özel operasyonları

	async settleAsync(
		id: string,
		settlement: {
			winnerUserId: string;
			note?: string;
		},
		actorId: string,
	): Promise<PromiseData | null> {
		try {
			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					status: "fulfilled",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "settled",
							meta: {
								winnerUserId: settlement.winnerUserId,
								note: settlement.note,
							},
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to settle promise ${id}: ${(error as Error).message}`);
		}
	}

	async coinFlipAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			// Random coin flip result
			const isHeads = Math.random() < 0.5;
			const result = isHeads ? "heads" : "tails";

			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "coin_flip",
							meta: { result },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to perform coin flip for promise ${id}: ${(error as Error).message}`);
		}
	}

	async extendAsync(id: string, minutes: number, actorId: string): Promise<PromiseData | null> {
		try {
			const extensionMinutes = minutes;
			const currentPromise = await PromiseModel.findById(id).where({ deletedAt: { $exists: false } });

			if (!currentPromise) {
				return null;
			}

			const newDueAt = currentPromise.dueAt
				? new Date(currentPromise.dueAt.getTime() + extensionMinutes * 60 * 1000)
				: new Date(Date.now() + extensionMinutes * 60 * 1000);

			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					dueAt: newDueAt,
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "extended",
							meta: { extensionMinutes, newDueAt },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to extend promise ${id}: ${(error as Error).message}`);
		}
	}

	// 5. Timeline & notifications operasyonları

	async getReceiptsAsync(id: string): Promise<
		Array<{
			_id: string;
			at: Date;
			actorId?: string;
			action: string;
			meta?: Record<string, unknown>;
		}>
	> {
		try {
			const promise = await PromiseModel.findById(id)
				.select("receipts")
				.where({ deletedAt: { $exists: false } });

			if (!promise) {
				return [];
			}

			return promise.receipts.map((receipt: any) => ({
				_id: receipt._id.toString(),
				at: receipt.at,
				actorId: receipt.actorId?.toString(),
				action: receipt.action || "",
				meta: receipt.meta,
			}));
		} catch (error) {
			throw new Error(`Failed to get receipts for promise ${id}: ${(error as Error).message}`);
		}
	}

	// 6. Paylaşım & erişim operasyonları

	async generateShareCodeAsync(id: string, actorId: string): Promise<PromiseData | null> {
		try {
			// Generate a unique share code
			const shareCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

			const updatedPromise = await PromiseModel.findByIdAndUpdate(
				id,
				{
					shareCode,
					visibility: "link",
					$push: {
						receipts: {
							at: new Date(),
							actorId: new mongoose.Types.ObjectId(actorId),
							action: "share_code_generated",
							meta: { shareCode },
						},
					},
					updatedAt: new Date(),
				},
				{ new: true, runValidators: true },
			).where({ deletedAt: { $exists: false } });

			return updatedPromise ? this.mapToPromise(updatedPromise) : null;
		} catch (error) {
			throw new Error(`Failed to generate share code for promise ${id}: ${(error as Error).message}`);
		}
	}

	async findByShareCodeAsync(shareCode: string): Promise<PromiseData | null> {
		try {
			const promise = await PromiseModel.findOne({
				shareCode,
				deletedAt: { $exists: false },
			});

			return promise ? this.mapToPromise(promise) : null;
		} catch (error) {
			throw new Error(`Failed to fetch promise with share code ${shareCode}: ${(error as Error).message}`);
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
