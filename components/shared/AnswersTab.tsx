import { SearchParamsProps } from '@/types';
import React from 'react';

interface AnswerTabProps extends SearchParamsProps {
    userId: string;
    clerkId: string | null;
}

const AnswersTab = async ({
    searchParams,
    userId,
    clerkId,
}: AnswerTabProps) => {
    return <div>AnswersTab</div>;
};

export default AnswersTab;