'use server';

import User from '@/database/user.model';
import { connectToDatabase } from '@/lib/mongoose';
import { CreateUserParams, DeleteUserParams, UpdateUserParams } from '@/lib/actions/shared.types';
import { revalidatePath } from 'next/cache';
import Question from '@/database/question.model';

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

        await User.findOneAndUpdate({clerkId}, updateData, {
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
        await Question.deleteMany({ author: user._id});

        // TODO: delete user answers, comments, etc.

        //  user is deleted two times - redundant!
        const deletedUser = await User.findByIdAndDelete(user._id);

        return deletedUser;

    } catch (e) {
        console.log(e);
        throw e;
    }
}