import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export const POST = async (req: Request) => {
    const { question } = await req.json();

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Tell me ${question}` }],
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};