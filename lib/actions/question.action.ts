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
    RecommendedParams,
} from '@/lib/actions/shared.types';
import Answer from '@/database/answer.model';
import Interaction from '@/database/interaction.model';

export async function getQuestions(params: GetQuestionsParams) {
    try {
        connectToDatabase();

        const { searchQuery, filter, page = 1, pageSize = 10 } = params;

        // Calculate the number of posts to skip based on the page
        // number and page size (number of posts per page)
        const skipAmount = (page - 1) * pageSize;

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
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions);

        const totalQuestions = await Question.countDocuments(query);
        const isNext = totalQuestions > (skipAmount + questions.length);

        return { questions, isNext };
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
        // part of the recommendation system
        await Interaction.create({
            user: author,
            action: 'ask_question',
            question: question._id,
            tags: tagDocuments,
        });

        // Increment author's reputation by +5 for creating a question
        await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

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

        // Increment author's reputation by +1/-1 for upvoting/revoking and
        // upvote on the question
        await User.findByIdAndUpdate(userId, {
            $inc: { reputation: hasupVoted ? -1 : 1 },
        });

        // Increment author's reputation by +10/-10 for recieving an
        // upvote/downvote on the question
        await User.findByIdAndUpdate(question.author, {
            $inc: { reputation: hasupVoted ? -10 : 10 },
        });

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
        await User.findByIdAndUpdate(userId, {
            $inc: { reputation: hasdownVoted ? -2 : 2 }
        });

        await User.findByIdAndUpdate(question.author, {
            $inc: { reputation: hasdownVoted ? -10 : 10 }
        });

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

export async function getRecommendedQuestions(params: RecommendedParams) {
    try {
        await connectToDatabase();

        const { userId, page = 1, pageSize = 20, searchQuery } = params;

        // find user
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            throw new Error("user not found");
        }

        const skipAmount = (page - 1) * pageSize;

        // Find the user's interactions
        const userInteractions = await Interaction.find({ user: user._id })
            .populate("tags")
            .exec();

        // Extract tags from user's interactions
        const userTags = userInteractions.reduce((tags, interaction) => {
            if (interaction.tags) {
                tags = tags.concat(interaction.tags);
            }
            return tags;
        }, []);

        // Get distinct tag IDs from user's interactions
        const distinctUserTagIds = [
            // @ts-ignore
            ...new Set(userTags.map((tag: any) => tag._id)),
        ];

        const query: FilterQuery<typeof Question> = {
            $and: [
                { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
                { author: { $ne: user._id } }, // Exclude user's own questions
            ],
        };

        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: "i" } },
                { content: { $regex: searchQuery, $options: "i" } },
            ];
        }

        const totalQuestions = await Question.countDocuments(query);

        const recommendedQuestions = await Question.find(query)
            .populate({
                path: "tags",
                model: Tag,
            })
            .populate({
                path: "author",
                model: User,
            })
            .skip(skipAmount)
            .limit(pageSize);

        const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

        return { questions: recommendedQuestions, isNext };
    } catch (error) {
        console.error("Error getting recommended questions:", error);
        throw error;
    }
}
