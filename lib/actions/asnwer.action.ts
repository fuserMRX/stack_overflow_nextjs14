'use server';

import { connectToDatabase } from '@/lib/mongoose';
import { CreateAnswerParams } from '@/lib/actions/shared.types';
import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import { revalidatePath } from 'next/cache';

export async function createAnswer(params: CreateAnswerParams) {
    try {
        connectToDatabase();

        const { content, author, question, path } = params;

        const newAnswer = new Answer({
            content,
            author,
            question,
        });

        // Add the answer to the question's answer array
        await Question.findByIdAndUpdate(question, {
            $push: { answers: newAnswer._id },
        });

        // TODO: add interaction to the user
        revalidatePath(path);
    } catch (error) {
        console.log(error);
        throw error;
    }
}