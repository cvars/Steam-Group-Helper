async function leaveGroupFunc(groupShortName) {
    const session = LocalSession.init(); // <-- use LocalSession
    console.log('API', 'Attempting to leave group', {
        groupShortName,
        sessionID: session.localSessionID,
        steamID: session.localSteamID
    });

    try {
        const res = await fetch(`https://steamcommunity.com/groups/${groupShortName}/memberslistxml/?xml=1`, {
            credentials: 'same-origin',
            headers: { 'Referer': window.location.href }
        });

        const text = await res.text();
        const match = text.match(/<groupID64>(\d+)<\/groupID64>/);
        const groupID64 = match?.[1];

        if (!groupID64) return { success: false, error: 'Could not find groupID64' };

        const formData = new FormData();
        formData.append('sessionID', session.localSessionID);
        formData.append('action', 'leaveGroup');
        formData.append('groupId', groupID64);

        const leaveRes = await fetch(`/profiles/${session.localSteamID}/home_process`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            redirect: 'manual',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `https://steamcommunity.com/groups/${groupShortName}`,
                'Origin': window.location.origin
            }
        });

        const leaveText = await leaveRes.text();
        console.log('API', 'Leave response received', {
            groupShortName,
            groupID64,
            status: leaveRes.status,
            preview: leaveText.substring(0, 200)
        });

        return { success: true, response: leaveText, groupId: groupID64 };
    } catch (error) {
        console.log('API', 'Error leaving group', { groupShortName, error });
        return { success: false, error: error.message };
    }
}

async function joinGroupFunc(groupShortName) {
    const session = LocalSession.init();
    console.log('API', 'Attempting to join group', {
        groupShortName,
        sessionID: session.localSessionID,
        steamID: session.localSteamID
    });

    try {
        const formData = new URLSearchParams();
        formData.append('sessionID', session.localSessionID);
        formData.append('action', 'join');

        const joinRes = await fetch(`https://steamcommunity.com/groups/${groupShortName}`, {
            method: 'POST',
            body: formData.toString(),
            credentials: 'same-origin',
            redirect: 'manual',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': `https://steamcommunity.com/groups/${groupShortName}`,
                'Origin': window.location.origin
            }
        });

        console.log('API', 'Join response received', {
            groupShortName,
            status: joinRes.status,
            location: joinRes.headers.get('location')
        });

        return { success: true, status: joinRes.status };
    } catch (error) {
        console.log('API', 'Error joining group', { groupShortName, error });
        return { success: false, error: error.message };
    }
}


// Main API object
const GroupAPI = {
    leaveGroup: leaveGroupFunc,
    leaveGroupMain: leaveGroupFunc,
    joinGroup: joinGroupFunc,
    joinGroupMain: joinGroupFunc
};

window.GroupAPI = GroupAPI;
