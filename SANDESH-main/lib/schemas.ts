import { z } from 'zod';

// Mirrors backend Pydantic models (backend/backend/main.py) so old clients keep working.
export const chatPartSchema = z.object({
  text: z.string().optional(),
});

export const chatMessageSchema = z.object({
  role: z.string(),
  parts: z.array(chatPartSchema).default([]),
});

export const assistantRequestSchema = z.object({
  userId: z.string().min(1).default('guest'),
  message: z.string().min(1).max(4000),
  language: z.string().default('English'),
  history: z.array(chatMessageSchema).default([]),
  image: z.string().max(5_000_000).optional(), // base64 data-url, ~3.5MB cap
});

export const guardRequestSchema = z.object({
  userId: z.string().min(1).default('guest'),
  message: z.string().max(4000).default(''),
  language: z.string().default('English'),
  image: z.string().max(5_000_000).optional(),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type GuardRequest = z.infer<typeof guardRequestSchema>;
