'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { AnswerSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { createAnswer } from '@/lib/actions/answer.action';
import { toast } from '@/hooks/use-toast';

interface AnswerProps {
    question: string;
    questionId: string;
    authorId?: string;
}

const Answer = ({ question, questionId, authorId }: AnswerProps) => {
    const pathname = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingAI, setIsSubmittingAI] = useState(false);
    const { theme } = useTheme();
    const skin =
        theme === 'dark' || theme === 'system' ? 'oxide-dark' : 'oxide';
    // eslint-disable-next-line camelcase
    const content_css =
        theme === 'dark' || theme === 'system' ? 'dark' : 'default';

    const editorRef = useRef(null);
    const form = useForm<z.infer<typeof AnswerSchema>>({
        resolver: zodResolver(AnswerSchema),
        defaultValues: {
            answer: '',
        },
    });

    const handleCreateAnswer = async (values: z.infer<typeof AnswerSchema>) => {
        if (!authorId) {
            return toast({
                title: 'Please login to answer',
                description: 'You need to be logged in to answer',
            });
        }

        setIsSubmitting(true);

        try {
            await createAnswer({
                content: values.answer,
                author: JSON.parse(authorId),
                question: JSON.parse(questionId),
                path: pathname,
            });

            form.reset();

            if (editorRef.current) {
                // @ts-ignore
                // { format: 'html', no_events: true } => prevents validation trigger after cleaning the content
                editorRef.current.setContent('', {
                    format: 'html',
                    no_events: true,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditorChange = (content: string) => {
        form.setValue('answer', content);
        form.trigger('answer'); // Manually trigger validation for explanation
    };

    const generateAIAnswer = async () => {
        if (!authorId) {
            return toast({
                title: 'Please login to generate AI answer',
                description: 'You need to be logged in to generate AI answer',
            });
        }

        setIsSubmittingAI(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,
                {
                    method: 'POST',
                    body: JSON.stringify({ question }),
                }
            );

            const aiAnswer = await response.json();
            const formattedAnwer = aiAnswer.reply.replace(/\n/g, '<br />');

            if (editorRef.current) {
                // @ts-ignore
                editorRef.current.setContent(formattedAnwer);
            }

            // Toast ...
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmittingAI(false);
        }
    };

    return (
        <div>
            <div
                className='mt-5 flex flex-col justify-between
            gap-5 sm:flex-row sm:items-center sm:gap-2'
            >
                <h4 className='paragraph-semibold text-dark400_light800'>
                    Write your answer here
                </h4>

                <Button
                    className='btn light-border-2 gap-1.5 rounded-md
                px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500'
                    onClick={generateAIAnswer}
                >
                    {isSubmittingAI ? (
                        <>Generating ...</>
                    ) : (
                        <>
                            <Image
                                src='/assets/icons/stars.svg'
                                alt='AI icon'
                                width={12}
                                height={12}
                                className='object-contain'
                            />
                            Generate an AI Answer
                        </>
                    )}
                </Button>
            </div>

            <Form {...form}>
                <form
                    className='mt-6 flex w-full flex-col gap-10'
                    onSubmit={form.handleSubmit(handleCreateAnswer)}
                >
                    <FormField
                        control={form.control}
                        name='answer'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormControl className='mt-3.5'>
                                    <Editor
                                        key={theme}
                                        apiKey={
                                            process.env
                                                .NEXT_PUBLIC_TINYMCE_API_KEY
                                        }
                                        onInit={(_evt, editor) =>
                                            // @ts-ignore
                                            (editorRef.current = editor)
                                        }
                                        onBlur={field.onBlur}
                                        onEditorChange={handleEditorChange}
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
                                <FormMessage className='text-red-500' />
                            </FormItem>
                        )}
                    />
                    <div className='flex justify-end'>
                        <Button
                            type='submit'
                            className='primary-gradient w-fit'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default Answer;
