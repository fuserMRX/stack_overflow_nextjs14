'use server';

import { revalidatePath } from 'next/cache';
import { FilterQuery } from 'mongoose';

import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';
import { connectToDatabase } from '@/lib/mongoose';
import {
    GetQuestionsParams, CreateQuestionParams,
    GetQuestionByIdParams, QuestionVoteParams,
    DeleteQuestionParams, EditQuestionParams,
} from '@/lib/actions/shared.types';
import Answer from '@/database/answer.model';
import Interaction from '@/database/interaction.model';

export async function getQuestions(params: GetQuestionsParams) {
    try {
        connectToDatabase();

        const { searchQuery, filter } = params;
        const query: FilterQuery<typeof Question> = {};

        if (searchQuery) {
            query.$or = [
                { title: { $regex: new RegExp(searchQuery, 'i') } },
                { content: { $regex: new RegExp(searchQuery, 'i') } },
            ];
        }

        let sortOptions = {};

        switch (filter) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'frequent':
                sortOptions = { views: -1 };
                break;
            case 'unanswered':
                query.answers = { $size: 0 };
                break;
            default:
                break;
        }

        // populate because we want to get the tags and author details
        const questions = await Question.find(query)
            .populate({ path: 'tags', model: Tag })
            .populate({ path: 'author', model: User })
            .sort(sortOptions);

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
                { $setOnInsert: { name: tag }, $push: { questions: question._id } },
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

export async function upvoteQuestion(params: QuestionVoteParams) {
    try {
        connectToDatabase();

        const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        // Action: Removes the user's ID from the upvotes array of the question.
        // Reason: The user is retracting their upvote (toggling it off).
        if (hasupVoted) {
            updateQuery = { $pull: { upvotes: userId } };
        } else if (hasdownVoted) {
            // Removes the user's ID from the downvotes array.
            // Adds the user's ID to the upvotes array.
            // Reason: The user is changing their vote from a downvote to an upvote.
            updateQuery = {
                $pull: { downvotes: userId },
                $push: { upvotes: userId },
            };
        } else {
            // Action: Adds the user's ID to the upvotes array if it's not already present.
            // Reason: The user is upvoting the question for the first time.
            updateQuery = { $addToSet: { upvotes: userId } };
        }

        // { new: true }: Option to return the modified document rather than the original.
        const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

        if (!question) {
            throw new Error('Question not found');
        }

        // Increment author's reputation

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
    try {
        connectToDatabase();

        const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        if (hasdownVoted) {
            updateQuery = { $pull: { downvotes: userId } };
        } else if (hasupVoted) {
            updateQuery = {
                $pull: { upvotes: userId },
                $push: { downvotes: userId },
            };
        } else {
            updateQuery = { $addToSet: { downvotes: userId } };
        }

        // { new: true }: Option to return the modified document rather than the original.
        const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

        if (!question) {
            throw new Error('Question not found');
        }

        // Increment author's reputation

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
    try {
        connectToDatabase();

        const { questionId, path } = params;

        await Question.deleteOne({ _id: questionId });
        await Answer.deleteMany({ question: questionId });
        await Interaction.deleteMany({ question: questionId });
        await Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId } });

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function editQuestion(params: EditQuestionParams) {
    try {
        connectToDatabase();

        const { questionId, title, content, path } = params;

        const question = await Question.findById(questionId).populate({ path: 'tags' });

        if (!question) {
            throw new Error('Question not found');
        }

        question.title = title;
        question.content = content;

        await question.save();

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getHotQuestions() {
    try {
        connectToDatabase();

        const hotQuestions = await Question.find({})
            .sort({ views: -1, upvotes: -1 }) // Descending order
            .limit(5);

        return hotQuestions;
    } catch (e) {
        console.log(e);
        throw e;
    }
}
