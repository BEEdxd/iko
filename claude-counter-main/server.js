require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL;

if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY in .env");
}

if (!CLAUDE_MODEL) {
    throw new Error("Missing CLAUDE_MODEL in .env");
}

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "IKO Claude token counter",
        model: CLAUDE_MODEL
    });
});

app.post("/api/claude/count-tokens", async (req, res) => {
    try {
        const { messages, system, tools } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                error: "messages must be an array"
            });
        }

        const payload = {
            model: CLAUDE_MODEL,
            messages
        };

        if (system !== undefined) {
            payload.system = system;
        }

        if (tools !== undefined) {
            payload.tools = tools;
        }

        const response = await fetch(
            "https://api.anthropic.com/v1/messages/count_tokens",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data
            });
        }

        if (!Number.isInteger(data.input_tokens)) {
            return res.status(502).json({
                error: "Anthropic did not return input_tokens"
            });
        }

        return res.json({
            input_tokens: data.input_tokens,
            model: CLAUDE_MODEL,
            source: "anthropic-count-tokens-api"
        });
    } catch (error) {
        console.error("Claude token-count error:", error);

        return res.status(500).json({
            error: "Token counting failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`IKO backend running at http://localhost:${PORT}`);
});