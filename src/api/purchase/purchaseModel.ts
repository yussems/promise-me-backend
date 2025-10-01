// models/Purchase.ts
import { model, Schema } from "mongoose";

const PurchaseSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },

		pricePaid: { type: Number, required: true },
		currency: { type: String, default: "USD" },

		provider: { type: String, enum: ["stripe", "revenuecat", "iap"], required: true },
		transactionId: { type: String, required: true }, // ödeme sağlayıcıdan gelen ID

		status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
	},
	{ timestamps: true },
);

export const PurchaseModel = model("Purchase", PurchaseSchema);
