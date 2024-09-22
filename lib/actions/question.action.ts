'use server';

import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';
import { connectToDatabase } from '@/lib/mongoose';
import { GetQuestionsParams, CreateQuestionParams, GetQuestionByIdParams } from '@/lib/actions/shared.types';
import { revalidatePath } from 'next/cache';

export async function getQuestions(params: GetQuestionsParams) {
    try {
        connectToDatabase();

        // populate because we want to get the tags and author details
        const questions = await Question.find({})
            .populate({ path: 'tags', model: Tag })
            .populate({ path: 'author', model: User })
            .sort({ createdAt: -1 });

        return { questions };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
    try {
        connectToDatabase();

        const { questionId } = params;

        // populate because we want to get the tags and author details
        const question = await Question.findById(questionId)
            .populate({ path: 'tags', model: Tag, select: '_id name' })
            .populate({ path: 'author', model: User, select: '_id clerkId name picture' });

        return question;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function createQuestion(params: CreateQuestionParams) {
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

        revalidatePath(path);
    } catch (error) {
        console.error(error);
    }
}