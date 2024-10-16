'use server';

import { connectToDatabase } from '@/lib/mongoose';
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams } from '@/lib/actions/shared.types';
import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import { revalidatePath } from 'next/cache';
import Interaction from '@/database/interaction.model';

export async function createAnswer(params: CreateAnswerParams) {
    try {
        connectToDatabase();

        const { content, author, question, path } = params;

        const newAnswer = await Answer.create({
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

export async function getAnswers(params: GetAnswersParams) {
    try {
        connectToDatabase();

        const { questionId, sortBy, page = 1, pageSize = 5 } = params;

        // Calculate the number of posts to skip based on the page
        // number and page size (number of posts per page)
        const skipAmount = (page - 1) * pageSize;

        let sortOptions = {};

        switch (sortBy) {
            case 'highestUpvotes':
                sortOptions = { upvotes: -1 };
                break;
            case 'lowestUpvotes':
                sortOptions = { upvotes: 1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'old':
                sortOptions = { createdAt: 1 };
                break;
            default:
                break;
        }

        const answers = await Answer.find({ question: questionId })
            .populate('author', '_id clerkId name picture')
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions);

        const totalAnswers = await Answer.countDocuments({
            question: questionId,
        });
        const isNext = totalAnswers > (skipAmount + answers.length);

        return { answers, isNext };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
    try {
        connectToDatabase();

        const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        // Action: Removes the user's ID from the upvotes array of the answer.
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
            // Reason: The user is upvoting the answer for the first time.
            updateQuery = { $addToSet: { upvotes: userId } };
        }

        // { new: true }: Option to return the modified document rather than the original.
        const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });

        if (!answer) {
            throw new Error('Answer not found');
        }

        // Increment author's reputation

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
    try {
        connectToDatabase();

        const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

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
        const question = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });

        if (!question) {
            throw new Error('Answer not found');
        }

        // Increment author's reputation

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
    try {
        connectToDatabase();

        const { answerId, path } = params;
        const answer = await Answer.findById(answerId);

        if (!answer) {
            throw new Error('Answer not found');
        }

        await answer.deleteOne({ _id: answerId });
        await Question.updateMany({ _id: answer.question },
            { $pull: { answers: answerId } });
        await Interaction.deleteMany({ answer: answerId });

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}