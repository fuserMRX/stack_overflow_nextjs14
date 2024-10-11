'use server';

import { FilterQuery } from 'mongoose';

import { connectToDatabase } from '@/lib/mongoose';
import {
    GetAllTagsParams, GetQuestionsByTagIdParams,
    GetTopInteractedTagsParams
} from '@/lib/actions/shared.types';
import User from '@/database/user.model';
import Tag, { ITag } from '@/database/tag.model';
import Question from '@/database/question.model';

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
    try {
        connectToDatabase();

        const { userId } = params;
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Find interactions for the user and group by tags
        // Interaction...

        return [{ _id: '1', name: 'tag1' }, { _id: '2', name: 'tag2' }];
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getAllTags(params: GetAllTagsParams) {
    try {
        connectToDatabase();

        const tags = await Tag.find({});

        return { tags };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
    try {
        connectToDatabase();

        const { tagId, page = 1, pageSize = 10, searchQuery } = params;

        const tagFilter: FilterQuery<ITag> = { _id: tagId };

        const tag = await Tag.findOne(tagFilter)
            .populate({
                path: 'questions',
                model: Question,
                match: searchQuery
                    ? { title: { $regex: searchQuery, $options: 'i' } }
                    : {},
                options: {
                    sort: { createdAt: -1 },
                },
                populate: [
                    { path: 'tags', model: Tag, select: '_id name' },
                    { path: 'author', model: User, select: '_id name username picture clerkId' }
                ]
            });

        if (!tag) {
            throw new Error('Tag not found');
        }

        const { questions } = tag || {};

        return { tagTitle: tag.name, questions };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function getPopularTags() {
    try {
        connectToDatabase();

        const popularTags = await Tag.aggregate([
            { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
            { $sort: { numberOfQuestions: -1 } },
            { $limit: 5 }
        ]);

        return popularTags;
    } catch (e) {
        console.log(e);
        throw e;
    }
}