import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Mongoose Schema
export interface IUser extends Document {
	name: string;
	email: string;
	age: number;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [50, "Name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
		},
		age: {
			type: Number,
			required: [true, "Age is required"],
			min: [0, "Age cannot be negative"],
			max: [150, "Age cannot exceed 150"],
		},
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
				delete (ret as any).__v;
				return ret;
			},
		},
	}
);

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);

// Zod Schema for validation (keeping for API documentation)
export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(50),
	email: z.string().email(),
	age: z.number().min(0).max(150),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: z.string().min(1, "User ID is required") }),
});

// Input Validation for creating a user
export const CreateUserSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
		email: z.string().email("Please enter a valid email"),
		age: z.number().min(0, "Age cannot be negative").max(150, "Age cannot exceed 150"),
	}),
});

// Input Validation for updating a user
export const UpdateUserSchema = z.object({
	params: z.object({ id: z.string().min(1, "User ID is required") }),
	body: z.object({
		name: z.string().min(2).max(50).optional(),
		email: z.string().email().optional(),
		age: z.number().min(0).max(150).optional(),
	}),
});
