'use client';

import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action';
import {
    downvoteQuestion,
    upvoteQuestion,
} from '@/lib/actions/question.action';
import { formatLargeNumber } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

interface VotingParams {
    type: string;
    itemId: string;
    userId: string;
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

    const handleSave = () => {};

    const handleVote = async (action: string) => {
        if (userId) {
            if (action === 'upvote' && type === 'question') {
                await upvoteQuestion({
                    questionId: JSON.parse(itemId),
                    userId: JSON.parse(userId),
                    hasupVoted,
                    hasdownVoted,
                    path: pathName,
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
            }

            if (action === 'downvote' && type === 'question') {
                await downvoteQuestion({
                    questionId: JSON.parse(itemId),
                    userId: JSON.parse(userId),
                    hasupVoted,
                    hasdownVoted,
                    path: pathName,
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
            }
        }
    };

    return (
        <div className='gap-5'>
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
                        width={16}
                        height={16}
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
                        width={16}
                        height={16}
                        className='cursor-pointer'
                        onClick={handleSave}
                    />
                )}
            </div>
        </div>
    );
};

export default Voting;
