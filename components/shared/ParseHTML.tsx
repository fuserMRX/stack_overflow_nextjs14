'use client';

import { useEffect, useState, useRef } from 'react';
import Prism from 'prismjs';
import parse from 'html-react-parser';

import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-aspnet';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-mongodb';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

interface ParseHTMLProps {
    data: string;
}

const ParseHTML = ({ data }: ParseHTMLProps) => {
    // useState and useEffect are used to run the Prism highlighting function after the component is mounted
    // and prevent mismatches between the server and client - hydrating the component
    const [mounted, setMounted] = useState(false); // This state determines if the component is mounted
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true); // Set the mounted state to true when the component is mounted
    }, []);

    useEffect(() => {
        if (mounted && ref.current) {
            Prism.highlightAllUnder(ref.current);
        }
    }, [mounted, data]); // Re-run highlighting when mounted or data changes

    if (!mounted) {
        // Avoid rendering on the server to prevent mismatches
        return null;
    }

    return <div className='markdown w-full min-w-full' ref={ref}>{parse(data)}</div>;
};

export default ParseHTML;
