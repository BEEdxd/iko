"use strict";

export async function countClaudeTokens({
    messages,
    system,
    tools,
    model
}) {
    const response =
        await fetch(
            "http://localhost:3000/api/claude/count-tokens",
            {
                method: "POST",

                headers: {
                    "content-type":
                        "application/json"
                },

                body: JSON.stringify({
                    model:
                        model ||
                        "claude-sonnet-4-6",

                    messages,

                    system,

                    tools
                })
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data.error ===
                "string"
                ? data.error
                : "Anthropic token counting failed"
        );
    }

    if (
        !Number.isInteger(
            data.input_tokens
        )
    ) {
        throw new Error(
            "No real Anthropic token count was returned"
        );
    }

    return data.input_tokens;
}