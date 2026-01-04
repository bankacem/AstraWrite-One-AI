const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Datastore = require('nedb');
const { GoogleGenAI } = require('@google/genai');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const dbPath = path.resolve(__dirname, 'apikeys.db');
const db = new Datastore({ filename: dbPath, autoload: true });
let activeKey = null;

db.findOne({ isActive: true }, (err, doc) => {
    if (doc) activeKey = doc;
});


const upload = multer();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Auth
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.DEMO_USER && password === process.env.DEMO_PASS) {
        req.session.user = { email };
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


// API Key Management (Protected)
app.get('/api/keys', isAuthenticated, (req, res) => {
    db.find({}, (err, docs) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve keys' });
        res.json(docs);
    });
});
app.post('/api/keys', isAuthenticated, (req, res) => {
    const { label, key, provider } = req.body;
    const newKey = { _id: uuidv4(), label, key, provider, usageCount: 0, articlesGenerated: 0, isActive: false };
    db.insert(newKey, (err, doc) => {
        if (err) return res.status(500).json({ error: 'Failed to save key' });
        res.status(201).json(doc);
    });
});
app.delete('/api/keys/:id', isAuthenticated, (req, res) => {
    db.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
        if (err || numRemoved === 0) return res.status(500).json({ error: 'Failed to delete key' });
        res.status(204).send();
    });
});
app.post('/api/keys/select/:id', isAuthenticated, (req, res) => {
    // First, deactivate all keys
    db.update({}, { $set: { isActive: false } }, { multi: true }, () => {
        // Then, activate the selected one
        db.update({ _id: req.params.id }, { $set: { isActive: true } }, {}, (err) => {
            if (err) return res.status(500).json({ error: 'Failed to select key' });
            db.findOne({ _id: req.params.id }, (err, doc) => {
                activeKey = doc;
                res.json(doc);
            });
        });
    });
});


// Proxies (Protected)
app.post('/api/gemini/:action', isAuthenticated, async (req, res) => {
    if (!activeKey) return res.status(400).json({ error: "No active API key selected." });

    const ai = new GoogleGenAI({ apiKey: activeKey.key });
    const { action } = req.params;

    try {
        if (action === 'stream') {
            const { config } = req.body;
            const response = await ai.models.generateContentStream({
                model: 'gemini-3-pro-preview',
                contents: config.prompt,
                config: config.config
            });
            res.setHeader('Content-Type', 'text/plain');
            for await (const chunk of response) {
                res.write(chunk.text || "");
            }
            res.end();
        } else {
            const result = await handleGeminiRequest(action, req.body, ai);
            res.json(result);
        }
    } catch (error) {
        console.error(`Error in /api/gemini/${action}:`, error);
        res.status(500).json({ error: `An error occurred in ${action}` });
    }
});
app.post('/api/openrouter/call', isAuthenticated, async (req, res) => {
    if (!activeKey) return res.status(400).json({ error: "No active API key selected." });

    const { prompt, model, systemInstruction } = req.body;

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model,
            messages: [
                ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
                { role: "user", content: prompt }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${activeKey.key}`,
                "HTTP-Referer": "https://astrawrite.ai",
                "X-Title": "AstraWrite One AI",
                "Content-Type": "application/json"
            }
        });
        res.json(response.data.choices?.[0]?.message?.content || "");
    } catch (error) {
        console.error('Error calling OpenRouter:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to call OpenRouter' });
    }
});
app.post('/api/openrouter/generate-image', isAuthenticated, async (req, res) => {
    if (!activeKey) return res.status(400).json({ error: "No active API key selected." });

    const { prompt } = req.body;

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/images/generations", {
            prompt: prompt,
            model: "google/gemini-pro-vision", // Or another free model
        }, {
            headers: {
                "Authorization": `Bearer ${activeKey.key}`,
                "HTTP-Referer": "https://astrawrite.ai",
                "X-Title": "AstraWrite One AI",
            }
        });
        // Assuming the response contains image data
        res.json(response.data);
    } catch (error) {
        console.error('Error generating image with OpenRouter:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate image with OpenRouter' });
    }
});
app.post('/api/wordpress/post', isAuthenticated, async (req, res) => {
    const { title, content, status, imageUrl, config } = req.body;
    const { url, username, applicationPassword } = config;

    if (!url || !username || !applicationPassword) {
        return res.status(400).json({ error: 'WordPress configuration is missing.' });
    }

    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64');
    const baseUrl = url.replace(/\/$/, '');
    let featured_media = null;

    try {
        if (imageUrl) {
            // Upload image to WordPress media library
            const imageResponse = await axios.post(`${baseUrl}/wp-json/wp/v2/media`, {
                file: imageUrl, // This might need adjustment depending on how the image is sent
                title: title,
                alt_text: title,
                status: 'publish'
            }, {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Disposition': `attachment; filename="${title}.png"`
                }
            });
            featured_media = imageResponse.data.id;
        }

        const response = await axios.post(`${baseUrl}/wp-json/wp/v2/posts`, {
            title,
            content,
            status,
            featured_media
        }, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error posting to WordPress:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to post to WordPress' });
    }
});


app.get('/', (req, res) => {
    res.send('AstraWrite One AI Server is running!');
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function handleGeminiRequest(action, body, ai) {
    if (action === 'generate-image') {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            ...body
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
            return { base64Image: part.inlineData.data };
        }
        throw new Error("Failed to generate image");
    }

    const model = (action === 'super-page-structure' || action === 'topic-cluster') ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';
    return ai.models.generateContent({ model, ...body });
}

module.exports = app;
module.exports.db = db;
