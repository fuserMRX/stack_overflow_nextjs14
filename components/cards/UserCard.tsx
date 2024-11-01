import { getTopInteractedTags } from '@/lib/actions/tag.actions';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import RenderTag from '@/components/shared/RenderTag';

interface UserCardProps {
    user: {
        _id: string;
        clerkId: string;
        picture: string;
        name: string;
        username: string;
    };
}

const UserCard = async ({ user }: UserCardProps) => {
    const interactedTags = await getTopInteractedTags({
        userId: user._id,
    });

    return (
        <article
            className='shadow-light100_darknone background-light900_dark200 light-border flex w-full
            flex-col items-center justify-center rounded-2xl border p-8 max-xs:min-w-full xs:w-[260px]'
        >
            <Link href={`/profile/${user.clerkId}`}>
                <Image
                    src={user.picture}
                    alt={user.name}
                    width={100}
                    height={100}
                    className='rounded-full'
                />
            </Link>

            <div className='mt-4 text-center'>
                <h3 className='h3-bold text-dark200_light900 line-clamp-1'>
                    {user.name}
                </h3>
                <p className='body-regular text-dark500_light500 mt-2'>
                    @{user.username ? user.username.toLowerCase() : user.name.toLowerCase()}
                </p>
            </div>

            <div className='mt-5'>
                {interactedTags.length ? (
                    <div className='flex items-center gap-2'>
                        {interactedTags.map((tag) => (
                            <RenderTag
                                key={tag._id}
                                _id={tag._id}
                                name={tag.name}
                            />
                        ))}
                    </div>
                ) : (
                    <Badge>No tags Yet</Badge>
                )}
            </div>
        </article>
    );
};


export default UserCard;
