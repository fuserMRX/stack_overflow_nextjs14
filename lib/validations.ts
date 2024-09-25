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