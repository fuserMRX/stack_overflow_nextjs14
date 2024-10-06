
import Link from 'next/link';
import Image from 'next/image';
import ParseHTML from './ParseHTML';

import Filter from '@/components/shared/Filter';
import { AnswerFilters } from '@/constants/filters';
import { getAnswers } from '@/lib/actions/answer.action';
import { getTimestamp } from '@/lib/utils';
import Votes from '@/components/shared/Votes';

interface AllAnswersProps {
    questionId: string;
    userId: string;
    totalAnswers: number;
    page?: number;
    filter?: number;
}

const AllAnswers = async ({
    questionId,
    userId,
    totalAnswers,
    page,
    filter,
}: AllAnswersProps) => {
    const results = await getAnswers({ questionId });

    return (
        <div className='mt-11'>
            <div className='flex items-center justify-between'>
                <h3 className='primary-text-gradient'>{`${totalAnswers === 1 ? totalAnswers + ' Answer' : totalAnswers + ' Answers'}`}</h3>
                <Filter filters={AnswerFilters} placeholder='Select a filter' />
            </div>
            <div className='mt-5'>
                {results.answers.map((answer) => (
                    <article
                        key={answer._id}
                        className='light-border border-b py-10'
                    >
                        <div className='flex items-center justify-between'>
                            <div
                                className='mb-8 flex w-full flex-col-reverse justify-between gap-5
                                sm:flex-row sm:items-center sm:gap-2'
                            >
                                <Link
                                    href={`/profile/${answer.author.clerkId}`}
                                    className='flex flex-1 items-start gap-1 sm:items-center'
                                >
                                    <Image
                                        src={answer.author.picture}
                                        width={20}
                                        height={20}
                                        alt='profile'
                                        className='rounded-full object-cover max-sm:mt-0.5'
                                    />
                                    <div className='flex flex-col sm:flex-row sm:items-center'>
                                        <p className='body-semibold text-dark300_light700 ml-0.5'>
                                            {answer.author.name}
                                        </p>
                                        <p className='small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1'>
                                            <span className='ml-0.5'>
                                                answered
                                            </span>{' '}
                                            {getTimestamp(answer.createdAt)}
                                        </p>
                                    </div>
                                </Link>
                                <div className='flex justify-end'>
                                    <Votes
                                        type='answer'
                                        itemId={JSON.stringify(answer._id)}
                                        userId={JSON.stringify(userId)}
                                        upvotes={answer.upvotes.length}
                                        downvotes={answer.downvotes.length}
                                        hasupVoted={answer.upvotes.includes(
                                            userId
                                        )}
                                        hasdownVoted={answer.downvotes.includes(
                                            userId
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <ParseHTML data={answer.content} />
                    </article>
                ))}
            </div>
        </div>
    );
};

export default AllAnswers;
