'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action';
import { viewQuestion } from '@/lib/actions/interaction.action';
import {
    downvoteQuestion,
    upvoteQuestion,
} from '@/lib/actions/question.action';
import { toggleSaveQuestion } from '@/lib/actions/user.action';
import { formatLargeNumber } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface VotingParams {
    type: string;
    itemId: string;
    userId?: string;
    upvotes: number;
    downvotes: number;
    hasupVoted: boolean;
    hasdownVoted: boolean;
    hasSaved?: boolean;
}

const Voting = ({
    type,
    itemId,
    userId,
    upvotes,
    downvotes,
    hasupVoted,
    hasdownVoted,
    hasSaved,
}: VotingParams) => {
    const pathName = usePathname();
    const router = useRouter();

    const handleSave = async () => {
        if (!userId) {
            return toast({
                title: 'Please login to save',
                description: 'You need to be logged in to save',
            });
        }

        await toggleSaveQuestion({
            userId: JSON.parse(userId),
            questionId: JSON.parse(itemId),
            path: pathName,
        });

        return toast({
            title: `Question ${!hasSaved ? 'Saved in' : 'Removed from'} your collection`,
            variant: !hasSaved ? 'default' : 'destructive',
        });
    };

    const handleVote = async (action: string) => {
        if (!userId) {
            return toast({
                title: 'Please login to vote',
                description: 'You need to be logged in to vote',
            });
        }

        if (action === 'upvote' && type === 'question') {
            await upvoteQuestion({
                questionId: JSON.parse(itemId),
                userId: JSON.parse(userId),
                hasupVoted,
                hasdownVoted,
                path: pathName,
            });

            return toast({
                title: `Upvote ${!hasupVoted ? 'Successful' : 'Removed'}`,
                variant: !hasupVoted ? 'default' : 'destructive',
            });
        }

        if (action === 'upvote' && type === 'answer') {
            await upvoteAnswer({
                answerId: JSON.parse(itemId),
                userId: JSON.parse(userId),
                hasupVoted,
                hasdownVoted,
                path: pathName,
            });

            return toast({
                title: `Upvote ${!hasupVoted ? 'Successful' : 'Removed'}`,
                variant: !hasupVoted ? 'default' : 'destructive',
            });
        }

        if (action === 'downvote' && type === 'question') {
            await downvoteQuestion({
                questionId: JSON.parse(itemId),
                userId: JSON.parse(userId),
                hasupVoted,
                hasdownVoted,
                path: pathName,
            });

            return toast({
                title: `Downvote ${!hasdownVoted ? 'Successful' : 'Removed'}`,
                variant: !hasdownVoted ? 'default' : 'destructive',
            });
        }

        if (action === 'downvote' && type === 'answer') {
            await downvoteAnswer({
                answerId: JSON.parse(itemId),
                userId: JSON.parse(userId),
                hasupVoted,
                hasdownVoted,
                path: pathName,
            });

            return toast({
                title: `Downvote ${!hasdownVoted ? 'Successful' : 'Removed'}`,
                variant: !hasdownVoted ? 'default' : 'destructive',
            });
        }
    };

    useEffect(() => {
        if (type === 'question') {
            viewQuestion({
                questionId: JSON.parse(itemId),
                userId: userId ? JSON.parse(userId) : undefined,
            });
        }
    }, [type, itemId, userId, pathName, router]);

    return (
        <div className='flex gap-5'>
            <div className='flex-center gap-2.5'>
                {/* upVotes */}
                <div className='flex-center gap-1.5'>
                    <Image
                        src={
                            hasupVoted
                                ? '/assets/icons/upvoted.svg'
                                : '/assets/icons/upvote.svg'
                        }
                        alt='Upvote'
                        width={18}
                        height={18}
                        className='cursor-pointer'
                        onClick={() => handleVote('upvote')}
                    />

                    <div
                        className='flex-center background-light700_dark400
                    min-w-[18px] rounded-sm p-1'
                    >
                        <p className='subtle-medium text-dark400_light900'>
                            {formatLargeNumber(upvotes)}
                        </p>
                    </div>
                </div>
                {/* downVotes */}
                <div className='flex-center gap-1.5'>
                    <Image
                        src={
                            hasdownVoted
                                ? '/assets/icons/downvoted.svg'
                                : '/assets/icons/downvote.svg'
                        }
                        alt='Downvote'
                        width={16}
                        height={16}
                        className='cursor-pointer'
                        onClick={() => handleVote('downvote')}
                    />

                    <div
                        className='flex-center background-light700_dark400
                    min-w-[18px] rounded-sm p-1'
                    >
                        <p className='subtle-medium text-dark400_light900'>
                            {formatLargeNumber(downvotes)}
                        </p>
                    </div>
                </div>
                {/* Saved questions */}
                {type === 'question' && (
                    <Image
                        src={
                            hasSaved
                                ? '/assets/icons/star-filled.svg'
                                : '/assets/icons/star-red.svg'
                        }
                        alt='Star'
                        width={18}
                        height={18}
                        className='cursor-pointer'
                        onClick={handleSave}
                    />
                )}
            </div>
        </div>
    );
};

export default Voting;
