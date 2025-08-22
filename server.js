// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Set up a more flexible CORS policy to allow all origins during development and production
app.use(cors());
app.use(express.json());

// IMPORTANT: Paste your API key here
const apiKey = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

// Serve static HTML files from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint for text generation
app.post('/generate-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ text });
        
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Failed to generate text.' });
    }
});

// Endpoint for text-to-speech generation
app.post('/generate-tts', async (req, res) => {
    try {
        const { text, voice } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required.' });
        }

        const payload = {
            contents: [{ parts: [{ text: text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice }
                    }
                }
            },
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        let response = null;
        let retries = 0;
        const maxRetries = 5;
        const baseDelay = 1000;

        while (retries < maxRetries) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * Math.pow(2, retries);
                    console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    break;
                }
            } catch (error) {
                retries++;
                const delay = baseDelay * Math.pow(2, retries);
                console.error(`Fetch error. Retrying in ${delay}ms...`, error);
                await new Promise(res => setTimeout(res, delay));
            }
        }
        
        if (!response || !response.ok) {
            throw new Error(`API call failed with status: ${response ? response.status : 'N/A'}`);
        }
        
        const result = await response.json();
        const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const mimeType = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

        if (audioData && mimeType) {
            res.json({ audioData, mimeType });
        } else {
            res.status(500).json({ error: 'No audio data was returned.' });
        }
    } catch (error) {
        console.error('Error generating TTS:', error);
        res.status(500).json({ error: 'Failed to generate speech.' });
    }
});

// Endpoint for image generation using the correct model and API call
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }
        
        const payload = { instances: [{ prompt: prompt }], parameters: { sampleCount: 1 } };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        let response = null;
        let retries = 0;
        const maxRetries = 5;
        const baseDelay = 1000;

        while (retries < maxRetries) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * Math.pow(2, retries);
                    console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    break;
                }
            } catch (error) {
                retries++;
                const delay = baseDelay * Math.pow(2, retries);
                console.error(`Fetch error. Retrying in ${delay}ms...`, error);
                await new Promise(res => setTimeout(res, delay));
            }
        }

        if (!response || !response.ok) {
            throw new Error(`API call failed with status: ${response ? response.status : 'N/A'}`);
        }
        
        const result = await response.json();
        const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;

        if (base64Data) {
            const imageUrl = `data:image/png;base64,${base64Data}`;
            res.json({ image: imageUrl });
        } else {
            res.status(500).json({ error: 'No image data was returned.' });
        }
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image.' });
    }
});

// Endpoint for handling the contact form submission
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('New Contact Form Submission:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    res.json({ message: 'Message sent successfully!' });
});

// Endpoint for handling the contact support form submission
app.post('/contact-support', (req, res) => {
    const { name, email, message } = req.body;
    console.log('New Contact Support Form Submission:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    res.json({ message: 'Support request submitted successfully!' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
