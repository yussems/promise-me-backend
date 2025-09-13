import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import mongoose, { type Document, Schema } from "mongoose";
import { z } from "zod";

extendZodWithOpenApi(z);

// Mongoose Schema
export interface IAuth extends Document {
	email: string;
	password: string;
	refreshToken?: string;
	lastLogin?: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const authSchema = new Schema<IAuth>(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
		refreshToken: {
			type: String,
			default: null,
		},
		lastLogin: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
				delete (ret as any).password;
				delete (ret as any).refreshToken;
				delete (ret as any).__v;
				return ret;
			},
		},
	},
);

// Create indexes
authSchema.index({ refreshToken: 1 });
authSchema.index({ createdAt: -1 });

export const AuthModel = mongoose.model<IAuth>("Auth", authSchema);

// Zod Schema for validation
export type Auth = z.infer<typeof AuthSchema>;
export const AuthSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	isActive: z.boolean(),
	lastLogin: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for login
export const LoginSchema = z.object({
	body: z.object({
		email: z.string().email("Please enter a valid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	}),
});

// Input Validation for register
export const RegisterSchema = z.object({
	body: z
		.object({
			email: z.string().email("Please enter a valid email"),
			password: z.string().min(6, "Password must be at least 6 characters"),
			confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ["confirmPassword"],
		}),
});

// Input Validation for refresh token
export const RefreshTokenSchema = z.object({
	body: z.object({
		refreshToken: z.string().min(1, "Refresh token is required"),
	}),
});

// Input Validation for logout
export const LogoutSchema = z.object({
	body: z.object({
		refreshToken: z.string().min(1, "Refresh token is required"),
	}),
});
