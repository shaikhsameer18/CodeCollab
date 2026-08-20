import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
    baseURL: 'https://api.deepinfra.com/v1/openai',
    apiKey: process.env.DEEPINFRA_API_KEY,
});

interface ChatCompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT: ChatCompletionMessage = {
    role: 'system',
    content: 'You are a helpful AI coding assistant.',
};
const MAX_HISTORY = 10;
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes of inactivity

// Conversation history is kept per client session (never shared across
// users) and swept periodically so idle sessions don't leak memory.
interface SessionEntry {
    history: ChatCompletionMessage[];
    lastActive: number;
}
const sessions = new Map<string, SessionEntry>();

setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of sessions) {
        if (now - entry.lastActive > SESSION_TTL_MS) sessions.delete(id);
    }
}, 5 * 60 * 1000).unref();

function getSession(sessionId: string): SessionEntry {
    let entry = sessions.get(sessionId);
    if (!entry) {
        entry = { history: [SYSTEM_PROMPT], lastActive: Date.now() };
        sessions.set(sessionId, entry);
    }
    return entry;
}

router.post('/ask', async (req, res) => {
    const { message } = req.body;
    const sessionId = req.header('X-Chat-Session');

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing X-Chat-Session header' });
    }

    console.log(`Chat message from session ${sessionId.slice(0, 8)}...`);

    const session = getSession(sessionId);
    session.lastActive = Date.now();

    try {
        session.history.push({ role: 'user', content: message });

        const completion = await openai.chat.completions.create({
            messages: session.history,
            model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
            max_tokens: 1000,
            temperature: 0.7,
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let aiResponse = '';

        for await (const chunk of completion) {
            if (chunk.choices && chunk.choices.length > 0) {
                const delta = chunk.choices[0].delta;
                if (delta?.content) {
                    aiResponse += delta.content;
                    res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
                }
            }
        }

        res.end();
        session.history.push({ role: 'assistant', content: aiResponse });

        // Keep the system prompt plus the most recent turns
        if (session.history.length > MAX_HISTORY + 1) {
            session.history = [SYSTEM_PROMPT, ...session.history.slice(-MAX_HISTORY)];
        }
    } catch (error: unknown) {
        console.error('DeepInfra API Error:', error);
        res.status(500).json({ error: 'AI service unavailable', details: error instanceof Error ? error.message : 'Unknown error' });
    }
});

export default router;
