'use server';

import { FilterQuery } from 'mongoose';
import User from '@/database/user.model';
import { connectToDatabase } from '@/lib/mongoose';
import {
    CreateUserParams, DeleteUserParams,
    GetAllUsersParams, GetSavedQuestionsParams,
    GetUserByIdParams, GetUserStatsParams,
    ToggleSaveQuestionParams, UpdateUserParams
} from '@/lib/actions/shared.types';
import { revalidatePath } from 'next/cache';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import Answer from '@/database/answer.model';

export async function getUserById(params: any) {
    try {
        connectToDatabase();

        const { userId } = params;
        const user = await User.findOne({ clerkId: userId });

        return user;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function createUser(userData: CreateUserParams) {
    try {
        connectToDatabase();

        const newUser = await User.create(userData);

        return newUser;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function updateUser(params: UpdateUserParams) {
    try {
        connectToDatabase();
        const { clerkId, updateData, path } = params;

        await User.findOneAndUpdate({ clerkId }, updateData, {
            new: true
        });

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function deleteUser(params: DeleteUserParams) {
    try {
        connectToDatabase();

        const { clerkId } = params;
        const user = await User.findOneAndDelete({ clerkId });

        if (!user) {
            throw new Error('User not found');
        }

        // Delete user from DB
        // and questions, answers, comments, etc.

        // get user question ids
        // const userQuestionIds = await Question.find({
        //     author: user._id
        // }).distinct('_id');

        // delete user questions
        await Question.deleteMany({ author: user._id });

        // TODO: delete user answers, comments, etc.

        //  user is deleted two times - redundant!
        // const deletedUser = await User.findByIdAndDelete(user._id);

        return user;

    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getAllUsers(params: GetAllUsersParams) {
    try {
        connectToDatabase();
        const { searchQuery } = params;
        const query: FilterQuery<typeof User> = {};

        if(searchQuery) {
            query.$or = [
                { name: { $regex: new RegExp(searchQuery, 'i') } },
                { username: { $regex: new RegExp(searchQuery, 'i') } },
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 });

        return { users };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
    try {
        connectToDatabase();

        const { userId, questionId, path } = params;
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const isQuestionSaved = user.saved.includes(questionId);

        if (isQuestionSaved) {
            await User.findByIdAndUpdate(userId,
                { $pull: { saved: questionId } },
                { new: true }
            )
        } else {
            await User.findByIdAndUpdate(userId,
                // $push will add another occurrence of questionId, leading to duplicates.
                // $addToSet: Adds a value to an array only if it does not already exist in the array.
                // If the value is already present, it does nothing, ensuring no duplicates.
                { $addToSet: { saved: questionId } },
                { new: true }
            )
        }

        revalidatePath(path);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
    try {
        connectToDatabase();

        const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params;

        const query: FilterQuery<typeof Question> = searchQuery
            ? { title: { $regex: new RegExp(searchQuery, 'i') } }
            : {};

        const user = await User.findOne({ clerkId })
            .populate({
                path: 'saved',
                match: query,
                options: {
                    sort: { createdAt: -1 },
                    // skip: (page - 1) * pageSize,
                    // limit: pageSize
                },
                populate: [
                    { path: 'tags', model: Tag, select: '_id name' },
                    { path: 'author', model: User, select: '_id name username picture' }
                ]
            });

        if (!user) {
            throw new Error('User not found');
        }

        const { saved } = user || {};

        return { questions: saved };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getUserInfo(params: GetUserByIdParams) {
    try {
        connectToDatabase();

        const { userId } = params;
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            throw new Error('User not found');
        }

        const totalQuestions = await Question.countDocuments({ author: user._id });
        const totalAnswers = await Answer.countDocuments({ author: user._id });

        return {
            user,
            totalQuestions,
            totalAnswers
        };

    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getUserQuestions(params: GetUserStatsParams) {
    try {
        connectToDatabase();

        const { userId, page = 1, pageSize = 10 } = params;

        const totalQuesions = await Question.countDocuments({ author: userId });
        const userQuestions = await Question.find({ author: userId })
            .sort({ views: -1, upvotes: -1 })
            .populate('tags', '_id name')
            .populate('author', '_id clerkId name picture');

        return { totalQuesions, questions: userQuestions };

    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getUserAnswers(params: GetUserStatsParams) {
    try {
        connectToDatabase();

        const { userId, page = 1, pageSize = 10 } = params;

        const totalAnswers = await Answer.countDocuments({ author: userId });
        const userAnswers = await Answer.find({ author: userId })
            .sort({ views: -1, upvotes: -1 })
            .populate('question', '_id title')
            .populate('author', '_id clerkId name picture');

        return { totalAnswers, answers: userAnswers };

    } catch (e) {
        console.log(e);
        throw e;
    }
}