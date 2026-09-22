window.IKO = window.IKO || {};

window.IKO.api = {
    async countTokens(messages) {
        const response = await fetch("http://localhost:3000/api/count-tokens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1",
                input: messages
            })
        });

        if (!response.ok) {
            throw new Error(`Token API error: ${response.status}`);
        }

        return await response.json();
    }
};