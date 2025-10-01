// models/Agreement.ts
import { model, Schema } from "mongoose";

const AgreementSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

		// Kaynak promise
		promiseId: { type: Schema.Types.ObjectId, ref: "Promise", required: true },

		// Kullanılan şablon
		templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },

		// Üretilmiş PDF linki (örn. S3 url)
		pdfUrl: { type: String },

		status: { type: String, enum: ["draft", "completed"], default: "draft" },
	},
	{ timestamps: true },
);

export const AgreementModel = model("Agreement", AgreementSchema);
