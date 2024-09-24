'use client';

import React, { useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Editor } from '@tinymce/tinymce-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QuestionsSchema } from '@/lib/validations';
import { createQuestion } from '@/lib/actions/question.action';
import { useRouter, usePathname } from 'next/navigation';

const type: any = 'create';

interface QuestionProps {
    mongoUserId: string;
}

const Question = ({ mongoUserId }: QuestionProps) => {
    const { theme } = useTheme();
    const skin = (theme === 'dark' || theme === 'system') ? 'oxide-dark' : 'oxide';
    // eslint-disable-next-line camelcase
    const content_css = (theme === 'dark' || theme === 'system') ? 'dark' : 'default';

    const editorRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const pathName = usePathname();

    // 1. Define your form.
    const form = useForm<z.infer<typeof QuestionsSchema>>({
        resolver: zodResolver(QuestionsSchema),
        defaultValues: {
            title: '',
            explanation: '',
            tags: [],
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof QuestionsSchema>) {
        setIsSubmitting(true);

        try {
            // make an async call to the DB -> create a question
            await createQuestion({
                title: values.title,
                content: values.explanation,
                tags: values.tags,
                author: JSON.parse(mongoUserId),
                path: pathName,
            });
            // navigate to the home page
            router.push('/');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: any
    ) => {
        if (e.key === 'Enter' && field.name === 'tags') {
            e.preventDefault();
            const tagInput = e.target as HTMLInputElement;
            const tagValue = tagInput.value.trim();

            if (tagValue.length) {
                if (tagValue.length > 15) {
                    return form.setError('tags', {
                        type: 'required',
                        message: 'Tag must be less than 15 characters',
                    });
                }

                if (!field.value.includes(tagValue as never)) {
                    form.setValue('tags', [...field.value, tagValue]);
                    tagInput.value = '';
                    form.clearErrors('tags');
                }
            }
        }
    };

    const handleTagRemove = (tag: string, field: any) => {
        const newTags = field.value.filter((t: string) => t !== tag);
        form.setValue('tags', newTags);

        if (!newTags.length) {
            form.setError('tags', {
                type: 'manual',
                message: 'At least one tag is required',
            });
        }
    };

    const handleEditorChange = (content: string) => {
        form.setValue('explanation', content);
        form.trigger('explanation'); // Manually trigger validation for explanation
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex w-full flex-col gap-10'
            >
                <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col'>
                            <FormLabel className='paragraph-semibold text-dark400_light800'>
                                Question Title{' '}
                                <span className='text-primary-500'>*</span>
                            </FormLabel>
                            <FormControl className='mt-3.5'>
                                <Input
                                    className='paragraph-regular no-focus
                    placeholder background-light800_dark400 light-border-2
                    text-dark300_light700 min-h-[46px] border'
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className='body-regular mt-2.5 text-light-500'>
                                This is your specific question.
                            </FormDescription>
                            <FormMessage className='text-red-500' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='explanation'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='paragraph-semibold text-dark400_light800'>
                                Detailed explanation of your problem{' '}
                                <span className='text-primary-500'>*</span>
                            </FormLabel>
                            <FormControl className='mt-3.5'>
                                <Editor
                                    key={theme}
                                    apiKey={
                                        process.env.NEXT_PUBLIC_TINYMCE_API_KEY
                                    }
                                    onInit={(_evt, editor) =>
                                        // @ts-ignore
                                        (editorRef.current = editor)
                                    }
                                    onBlur={field.onBlur}
                                    onEditorChange={handleEditorChange}
                                    initialValue=''
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: [
                                            'advlist',
                                            'autolink',
                                            'lists',
                                            'link',
                                            'image',
                                            'charmap',
                                            'preview',
                                            'anchor',
                                            'searchreplace',
                                            'visualblocks',
                                            'codesample',
                                            'fullscreen',
                                            'insertdatetime',
                                            'media',
                                            'table',
                                        ],
                                        toolbar:
                                            'undo redo | blocks | ' +
                                            'codesample | bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist | ' +
                                            'removeformat',
                                        content_style:
                                            'body { font-family:Inter; font-size:16px }',
                                        skin,
                                        // eslint-disable-next-line camelcase
                                        content_css,
                                    }}
                                />
                            </FormControl>
                            <FormDescription className='body-regular mt-2.5 text-light-500'>
                                Introduce a problem and expand on what you put
                                in the title. Minimum 20 characters
                            </FormDescription>
                            <FormMessage className='text-red-500' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='tags'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col'>
                            <FormLabel className='paragraph-semibold text-dark400_light800'>
                                Tags <span className='text-primary-500'>*</span>
                            </FormLabel>
                            <FormControl className='mt-3.5'>
                                <>
                                    <Input
                                        placeholder='Add tags...'
                                        className='paragraph-regular no-focus
                    placeholder background-light800_dark400 light-border-2
                    text-dark300_light700 min-h-[46px] border'
                                        onKeyDown={(e) =>
                                            handleInputKeyDown(e, field)
                                        }
                                    />
                                    {!!field.value.length && (
                                        <div className='flex-start mt-2.5 gap-2.5'>
                                            {field.value.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    className='subtle-medium
                                                background-light800_dark300 text-light400_light500
                                                flex items-center justify-center gap-2 rounded-md border-none
                                                px-4 py-2 capitalize'
                                                    onClick={() =>
                                                        handleTagRemove(
                                                            tag,
                                                            field
                                                        )
                                                    }
                                                >
                                                    {tag}
                                                    <Image
                                                        src='/assets/icons/close.svg'
                                                        alt='close'
                                                        width={12}
                                                        height={12}
                                                        className='cursor-pointer
                                                object-contain invert-0 dark:invert'
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </>
                            </FormControl>
                            <FormDescription className='body-regular mt-2.5 text-light-500'>
                                Add up to 3 tags to describe what your question
                                is about. You need to press enter to add a tag.
                            </FormDescription>
                            <FormMessage className='text-red-500'>
                                {form.formState.errors.tags?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
                <Button
                    type='submit'
                    className='primary-gradient w-fit !text-light-900'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>{type === 'edit' ? 'Editing...' : 'Posting...'}</>
                    ) : (
                        <>
                            {type === 'edit'
                                ? 'Edit Question'
                                : 'Ask a question'}
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default Question;
