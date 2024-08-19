'use client';

import React from 'react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface RenderFilterProps {
    filters: {
        name: string;
        value: string;
    }[];
    otherClasses?: string;
    containerClasses?: string;
    placeholder?: string;
}

const Filter = ({
    filters,
    otherClasses,
    containerClasses,
    placeholder,
}: RenderFilterProps) => {
    return (
        <div className={`relative ${containerClasses}`}>
            <Select>
                <SelectTrigger
                    className={`${otherClasses}
                    body-regular light-border-2 background-light800_dark300
                     border px-5 py-2.5 `}
                >
                    <div className='line-clamp-1 flex-1 text-left'>
                        <SelectValue placeholder={placeholder} />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {filters.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                                {filter.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default Filter;
