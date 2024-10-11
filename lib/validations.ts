import { z } from 'zod';

export const QuestionsSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
    explanation: z.string().min(20, "Explanation must be at least 10 characters"),
    tags: z.array(
        z.string()
            .min(1, "Each tag must be at least 1 character long")
            .max(15, "Each tag must be less than 15 characters")
    )
        .min(1, "You must add at least 1 tag")
        .max(3, "You can add up to 3 tags only"),
});

export const AnswerSchema = z.object({
    answer: z.string().min(20)
});

export const ProfileSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters").max(50, "Name must be less than 50 characters"),
    username: z.string().min(5, "Username must be at least 5 characters").max(20, "Username must be less than 20 characters"),
    portfolioWebsite: z.union([z.literal(""), z.string().trim().url()]),
    location: z.string().min(5).max(50, "Location must be less than 50 characters").optional(),
    bio: z.string().max(150, "Bio must be less than 150 characters").optional(),
});