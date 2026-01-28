const ProfileData = {
    // Get SteamID of the profile currently being viewed
    getViewedSteamID: function() {
        // Method 1: Check if we're on someone else's profile page
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const text = script.textContent || '';
            
            // Look for g_rgProfileData (this is the viewed user's data)
            const match = text.match(/g_rgProfileData\s*=\s*{[^}]*"steamid"\s*:\s*"(\d+)"/);
            if (match) {
                const viewedSteamID = match[1];
                const mySteamID = LocalSession.getLocalSteamID();
                
                // If it's different from ours, return it
                if (viewedSteamID !== mySteamID) {
                    return viewedSteamID;
                }
            }
        }
        
        // Method 2: Check URL for profiles/ID or id/username
        const urlMatch = window.location.pathname.match(/\/(?:profiles|id)\/([^\/]+)/);
        if (urlMatch) {
            const pathPart = urlMatch[1];
            const mySteamID = LocalSession.getLocalSteamID();
            
            // If it's a numeric SteamID and different from ours
            if (/^\d+$/.test(pathPart) && pathPart !== mySteamID) {
                return pathPart;
            }
            // If it's a custom URL, we'll need to fetch to get SteamID
        }
        
        return null;
    },
    
    // Fetch groups for any SteamID
    fetchGroups: async function(steamID) {
        if (!steamID) return [];
        
        try {
            const groupsUrl = `https://steamcommunity.com/profiles/${steamID}/groups/`;
            const res = await fetch(groupsUrl, { credentials: 'include' });
            const text = await res.text();
            const groupMatches = [...text.matchAll(/\/groups\/([^\/"]+)/g)];
            const groups = [...new Set(groupMatches.map(m => m[1]))];
            return groups;
        } catch (err) {
            console.error('[ProfileData] Failed to fetch groups:', err);
            return [];
        }
    }
};

window.ProfileData = ProfileData;