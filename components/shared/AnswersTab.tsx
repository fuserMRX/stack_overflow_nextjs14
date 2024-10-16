import React from 'react';

import { getUserAnswers } from '@/lib/actions/user.action';
import { SearchParamsProps } from '@/types';
import AnswerCard from '@/components/cards/AnswerCard';
import Pagination from '@/components/shared/Pagination';

interface AnswerTabProps extends SearchParamsProps {
    userId: string;
    clerkId?: string | null;
}

const AnswersTab = async ({
    userId,
    clerkId,
    searchParams,
}: AnswerTabProps) => {
    const result = await getUserAnswers({
        userId,
        page: searchParams.page ? +searchParams.page : 1,
    });

    return (
        <>
            {result.answers.map((answer) => (
                <AnswerCard
                    key={answer._id}
                    _id={answer._id}
                    clerkId={clerkId}
                    question={answer.question}
                    author={answer.author}
                    upvotes={answer.upvotes.length}
                    createdAt={answer.createdAt}
                    content={answer.content}
                />
            ))}

            <div className='mt-10'>
                <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={result.isNext}
                />
            </div>
        </>
    );
};

export default AnswersTab;