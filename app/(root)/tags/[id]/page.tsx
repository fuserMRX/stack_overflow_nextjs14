import React from 'react';

import QuestionCard from '@/components/cards/QuestionCard';
import NoResult from '@/components/shared/NoResult';
import { getQuestionsByTagId } from '@/lib/actions/tag.actions';
import LocalSearchBar from '@/components/shared/search/LocalSearchBar';
import { URLProps } from '@/types';

const TagDetailsPage = async ({ params, searchParams }: URLProps) => {
    const { tagTitle, questions } = await getQuestionsByTagId({
        tagId: params.id,
        page: 1,
        searchQuery: searchParams.q,
    });

    return (
        <>
            <h1 className='h1-bold text-dark100_light900'>{tagTitle}</h1>
            <div className='mt-11 w-full'>
                <LocalSearchBar
                    route={`/tags/${params.id}`}
                    iconPosition='left'
                    imgSrc='/assets/icons/search.svg'
                    placeholder='Search for tag questions'
                    otherClasses='flex-1'
                />
            </div>

            <div className='mt-10 flex w-full flex-col gap-6'>
                {questions?.length ? (
                    questions.map((question: any) => (
                        <QuestionCard
                            key={question._id}
                            _id={question._id}
                            title={question.title}
                            tags={question.tags}
                            author={question.author}
                            upvotes={question.upvotes}
                            views={question.views}
                            answers={question.answers}
                            createdAt={question.createdAt}
                        />
                    ))
                ) : (
                    <NoResult
                        title='There is no tag questions to show'
                        description='Be first to break the silence!'
                        link='/ask-question'
                        linkTitle='Ask a Question'
                    />
                )}
            </div>
        </>
    );
};

export default TagDetailsPage;
