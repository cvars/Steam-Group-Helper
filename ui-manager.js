const UIManager = {
    injectedButtons: new Set(),
    myGroups: [], // from window.mySteamGroups
    theirGroups: [], // from viewed profile

    // Initialize group data
    initGroupData: async function() {
        this.myGroups = window.mySteamGroups || [];
        const viewedSteamID = ProfileData.getViewedSteamID();
        if (viewedSteamID) {
            this.theirGroups = await ProfileData.fetchGroups(viewedSteamID);
            console.log(`[UI] Loaded ${this.theirGroups.length} groups from profile ${viewedSteamID}`);
        }
    },

    // Check membership
    isInGroup: function(groupSlug) {
        return this.myGroups.includes(groupSlug);
    },

    theyAreInGroup: function(groupSlug) {
        return this.theirGroups.includes(groupSlug);
    },

    createSmartButton: function(groupSlug) {
        const container = document.createElement('div');
        container.style.marginLeft = 'auto';
        container.style.marginRight = '16px';

        const btn = document.createElement('a');
        btn.className = 'linkStandard btn_small_tall';
        btn.dataset.groupSlug = groupSlug;

        // Fixed width for uniformity
        const fixedWidth = 130;

        Object.assign(btn.style, {
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'background-color 0.2s, transform 0.1s',
            position: 'relative',
            border: '1px solid #1b2838',
            borderRadius: '6px',
            padding: '6px 16px',
            width: fixedWidth + 'px',
            height: '36px',
            fontWeight: '600',
            fontSize: '13px',
            boxSizing: 'border-box',
            color: '#fff',
            userSelect: 'none',
            whiteSpace: 'nowrap',
        });

        const span = document.createElement('span');
        btn.appendChild(span);
        container.appendChild(btn);

        // Determine current membership
        let iAmIn = this.isInGroup(groupSlug);

        const updateButton = () => {
            if (iAmIn) {
                span.textContent = 'Leave Group';
                btn.style.backgroundColor = '#d9534f';
            } else {
                span.textContent = 'Join Group';
                btn.style.backgroundColor = '#28a745';
            }
            btn.dataset.bgColor = btn.style.backgroundColor;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        };

        const handleClick = async () => {
            btn.style.pointerEvents = 'none';
            if (iAmIn) {
                span.textContent = 'Leaving...';
                btn.style.backgroundColor = '#c9302c';
                const success = await GroupAPI.leaveGroupMain(groupSlug);
                if (success?.success) {
                    this.myGroups = this.myGroups.filter(g => g !== groupSlug);
                    iAmIn = false;
                    span.textContent = 'Left ✓';
                    btn.style.backgroundColor = '#28a745';
                } else {
                    span.textContent = 'Failed!';
                    btn.style.backgroundColor = '#ff0000';
                }
            } else {
                span.textContent = 'Joining...';
                btn.style.backgroundColor = '#218838';
                const success = await GroupAPI.joinGroupMain(groupSlug);
                if (success?.success) {
                    this.myGroups.push(groupSlug);
                    iAmIn = true;
                    span.textContent = 'Joined ✓';
                    btn.style.backgroundColor = '#d9534f'; // now becomes Leave color
                } else {
                    span.textContent = 'Failed!';
                    btn.style.backgroundColor = '#ff0000';
                }
            }

            // Reset after 2 seconds to proper toggle state
            setTimeout(updateButton, 2000);
        };

        btn.addEventListener('click', handleClick);

        // Hover effect
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.backgroundColor = iAmIn ? '#c9302c' : '#218838';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.backgroundColor = btn.dataset.bgColor;
        });

        updateButton(); // initial state
        return container;
    },

    // Inject button into a single group row
    injectButtonIntoRow: function(row) {
        const titleLink = row.querySelector('.linkTitle');
        if (!titleLink) return;

        const match = titleLink.href.match(/\/groups\/([^\/]+)/);
        if (!match) return;

        const groupSlug = match[1];
        if (this.injectedButtons.has(groupSlug)) return;

        this.injectedButtons.add(groupSlug);

        const smartBtn = this.createSmartButton(groupSlug);
        row.appendChild(smartBtn);

        Object.assign(row.style, { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
        });
    },

    // Find all group rows
    findAllGroupRows: function() {
        return document.querySelectorAll('.invite_row_left.invite_row_content');
    },

    // Inject buttons for all rows
    injectAllButtons: function() {
        const rows = this.findAllGroupRows();
        const newRows = Array.from(rows).filter(row => !row.dataset.uiInjected);

        if (newRows.length > 0) console.log(`[UI] Added ${newRows.length} smart buttons`);

        newRows.forEach(row => {
            row.dataset.uiInjected = "1";
            this.injectButtonIntoRow(row);
        });
    }
};

window.UIManager = UIManager;
