'use server';

import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import { connectToDatabase } from '@/lib/mongoose';

export async function createQuestion(params: any) {
    try {
        connectToDatabase();

        const { title, content, tags, author, path } = params;
        // Create a new question
        const question = await Question.create({
            title,
            content,
            author,
        });

        const tagDocuments = [];

        // Create tags if they don't exist
        for (const tag of tags) {
            const existingTag = await Tag.findOneAndUpdate(
                // find a tag by name
                { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
                { $setOnInsert: { name: tag }, $push: { question: question._id } },
                { upsert: true, new: true }
            );

            tagDocuments.push(existingTag);
        }

        // Add tags to the question
        await Question.findByIdAndUpdate(question._id,
            { $push: { tags: { $each: tagDocuments } } });

        // Create an interaction record for the user's ask_question action

        // Increment author's reputation by +5 for creating a question
    } catch (error) {
        console.error(error);
    }
}