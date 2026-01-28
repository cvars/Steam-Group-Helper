(function() {
    console.log('Main', 'Steam Group Manager loaded');

    const session = LocalSession.init();
    
    // Initialize group data and UI
    (async () => {
        // Always fetch and log OUR groups
        const steamID = LocalSession.getLocalSteamID();
        if (!steamID) {
            console.warn('[Groups] Could not find SteamID');
            return;
        }

        try {
            const groupsUrl = `https://steamcommunity.com/profiles/${steamID}/groups/`;
            const res = await fetch(groupsUrl, { credentials: 'include' });
            const text = await res.text();
            const groupMatches = [...text.matchAll(/\/groups\/([^\/"]+)/g)];
            const groups = [...new Set(groupMatches.map(m => m[1]))];
            
            // Store for programmatic use
            window.mySteamGroups = groups;
            
            // Always show count and collapsed list
            console.log(`[Groups] You (${steamID}) have ${groups.length} groups`);
            console.groupCollapsed(`[Groups] Your groups (${groups.length})`);
            console.log('Groups:', groups);
            console.groupEnd();
            
            // Initialize UI with our groups
            await UIManager.initGroupData();
            
            // Inject buttons
            UIManager.injectAllButtons();
            
            // Observe DOM changes to inject buttons dynamically
            const observer = new MutationObserver(() => UIManager.injectAllButtons());
            observer.observe(document.body, { childList: true, subtree: true });
            
        } catch (err) {
            console.error('[Groups] Failed to fetch:', err.message);
        }
    })();
})();