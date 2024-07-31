import {
    SignedIn,
    UserButton,
} from "@clerk/nextjs";

const Home = () => {
    return (
        <div>
            Home
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    );
};

export default Home;
