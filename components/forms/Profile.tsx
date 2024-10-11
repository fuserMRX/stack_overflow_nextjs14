'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ProfileSchema } from '@/lib/validations';
import { usePathname, useRouter } from 'next/navigation';
import { updateUser } from '@/lib/actions/user.action';

interface ProfileProps {
    clerkId: string;
    user: string;
}

const Profile = ({ clerkId, user }: ProfileProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    let parsedUser = null;

    try {
        parsedUser = JSON.parse(user);
    } catch (e) {
        console.error(e);
    }

    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: parsedUser.name || '',
            username: parsedUser.username || '',
            portfolioWebsite: parsedUser.portfolioWebsite || '',
            location: parsedUser.location || '',
            bio: parsedUser.bio || '',
        },
    });

    async function onSubmit(values: z.infer<typeof ProfileSchema>) {
        setIsSubmitting(true);

        try {
            // update user
            await updateUser({
                clerkId,
                updateData: {
                    name: values.name,
                    username: values.username,
                    portfolioWebsite: values.portfolioWebsite,
                    location: values.location,
                    bio: values.bio,
                },
                path: pathname,
            });
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='mt-9 flex w-full flex-col gap-9'
            >
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className='space-y-3.5'>
                            <FormLabel>
                                Name <span className='text-red-500'>*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder='name'
                                    className={`no-focus paragraph-regular light-border-2 ${field.value ? 'text-dark300_light700' : 'placeholder'}
                                    background-light800_darkgradient text-dark300_light700 min-h-[56px]`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='username'
                    render={({ field }) => (
                        <FormItem className='space-y-3.5'>
                            <FormLabel>
                                Username <span className='text-red-500'>*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder='username'
                                    className={`no-focus paragraph-regular light-border-2 ${field.value ? 'text-dark300_light700' : 'placeholder'}
                                    background-light800_darkgradient text-dark300_light700 min-h-[56px]`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='portfolioWebsite'
                    render={({ field }) => (
                        <FormItem className='space-y-3.5'>
                            <FormLabel>Portfolio Link</FormLabel>
                            <FormControl>
                                <Input
                                    type='url'
                                    placeholder='portfolio url'
                                    className={`no-focus paragraph-regular light-border-2 ${field.value ? 'text-dark300_light700' : 'placeholder'}
                                    background-light800_darkgradient text-dark300_light700 min-h-[56px]`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='location'
                    render={({ field }) => (
                        <FormItem className='space-y-3.5'>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder='location'
                                    className={`no-focus paragraph-regular light-border-2 ${field.value ? 'text-dark300_light700' : 'placeholder'}
                                    background-light800_darkgradient text-dark300_light700 min-h-[56px]`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                        <FormItem className='space-y-3.5'>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder='bio'
                                    className={`no-focus paragraph-regular light-border-2 ${field.value ? 'text-dark300_light700' : 'placeholder'}
                                    background-light800_darkgradient text-dark300_light700 min-h-[56px]`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='mt-7 flex justify-end'>
                    <Button
                        type='submit'
                        className='primary-gradient w-fit'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default Profile;
