import React from "react";
import {
    SignedIn,
    UserButton,
} from "@clerk/nextjs";

const AskQuestion = () => {
    return (
        <div>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    );
};

export default AskQuestion;
