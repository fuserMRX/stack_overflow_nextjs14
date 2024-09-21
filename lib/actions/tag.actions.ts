'use server';

import { connectToDatabase } from '@/lib/mongoose';
import { GetTopInteractedTagsParams } from './shared.types';
import User from '@/database/user.model';

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
    try {
        connectToDatabase();

        const { userId } = params;
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Find interactions for the user and group by tags
        // Interaction...

        return [{ _id: '1', name: 'tag1' }, { _id: '2', name: 'tag2' }];
    } catch (e) {
        console.log(e);
        throw e;
    }
}