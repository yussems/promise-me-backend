import { model, Schema } from "mongoose";

const TemplateSchema = new Schema(
	{
		name: { type: String, required: true }, // Şablon ismi
		description: { type: String }, // Açıklama
		sku: { type: String, unique: true, index: true }, // Ödeme sisteminde ID
		price: { type: Number, required: true }, // 0 => ücretsiz
		currency: { type: String, default: "USD" },
		previewUrl: { type: String }, // Thumbnail / önizleme
		filePath: { type: String }, // HTML dosyasının yolu
		tags: [String],
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default model("Template", TemplateSchema);
