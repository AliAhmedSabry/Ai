// server/index.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { message, documentContent, conversationHistory } = req.body;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-chat:generateMessage?key=AIzaSyC32qQTVGwtcdTsp3YdmbnujrEfnu8_LPk`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            author: 'system',
                            content: [{
                                type: 'text',
                                text: `
You are a smart AI assistant like ChatGPT.
- Answer questions about the document.
- Summarize, explain, or search within the document.
- Respond in any language.
DOCUMENT:
${documentContent}
              `}]
                        },
                        ...conversationHistory.map(m => ({
                            author: m.role === 'user' ? 'user' : 'assistant',
                            content: [{ type: 'text', text: m.content }]
                        })),
                        { author: 'user', content: [{ type: 'text', text: message }] }
                    ],
                    max_output_tokens: 800
                })
            }
        );

        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.map(c => c.text).join('')
            || "Sorry, I couldn't generate a response.";

        res.json({ response: aiResponse });
    } catch (err) {
        console.error(err);
        res.json({ response: "Sorry, I couldn't generate a response." });
    }
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
