const { DestinationAdapter, AdapterError } = require("./adapter-interface.js");

class ClaudeDestinationAdapter extends DestinationAdapter {
    constructor() {
        super("Claude");
    }

    async openDestination() {
        const target = "https://claude.ai/new";
        const opened = window.open(target, "_blank");
        if (!opened) {
            throw new AdapterError("The browser blocked the destination tab. Allow pop-ups for IKO and try again.");
        }
        return { status: "opened", url: target };
    }

    async prepareMigration(migrationPackage) {
        if (!migrationPackage) throw new AdapterError("Migration package is required.");
        if (!globalThis.chrome?.storage?.local) throw new AdapterError("Chrome storage is unavailable.");
        await new Promise((resolve, reject) => chrome.storage.local.set({ ikoPendingMigration: migrationPackage }, () => {
            const error = chrome.runtime?.lastError;
            error ? reject(new AdapterError(error.message)) : resolve();
        }));
        return { status: "prepared", destination: "Claude", package: migrationPackage };
    }

    async injectContext() {
        throw new AdapterError("Context injection is handled by the destination page.");
    }
}

module.exports = { ClaudeDestinationAdapter };
