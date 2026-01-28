const LocalSession = {
    _cached: null,

    _scanScripts: function() {
        const scripts = document.querySelectorAll('script');
        let localSessionID = null;
        let localSteamID = null;

        for (const script of scripts) {
            const text = script.textContent || '';

            if (!localSessionID) {
                const match = text.match(/g_sessionID\s*=\s*"([^"]+)"/);
                if (match) localSessionID = match[1];
            }

            if (!localSteamID) {
                const match = text.match(/g_steamID\s*=\s*"([^"]+)"/);
                if (match) localSteamID = match[1];
            }

            if (localSessionID && localSteamID) break;
        }

        return { localSessionID, localSteamID };
    },

    init: function() {
        if (!this._cached) {
            const { localSessionID, localSteamID } = this._scanScripts();
            this._cached = { localSessionID, localSteamID };
            console.log('[LocalSession] Initialized', this._cached);
        }
        return this._cached;
    },

    getLocalSessionID: function() {
        return this.init().localSessionID;
    },

    getLocalSteamID: function() {
        return this.init().localSteamID;
    }
};

window.LocalSession = LocalSession;
