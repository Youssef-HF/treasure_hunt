/* ============================
   ScoreZone - SQL Injection CTF
   ============================ */

// --- Player Database (simulated) ---
const playersDB = [
    { id: 1, name: "Lionel Messi", team: "Inter Miami", position: "Forward", nationality: "Argentina", goals: 12 },
    { id: 2, name: "Cristiano Ronaldo", team: "Al-Nassr", position: "Forward", nationality: "Portugal", goals: 15 },
    { id: 3, name: "Kylian Mbappé", team: "Real Madrid", position: "Forward", nationality: "France", goals: 21 },
    { id: 4, name: "Mohamed Salah", team: "Liverpool", position: "Forward", nationality: "Egypt", goals: 18 },
    { id: 5, name: "Erling Haaland", team: "Manchester City", position: "Forward", nationality: "Norway", goals: 16 },
    { id: 6, name: "Jude Bellingham", team: "Real Madrid", position: "Midfielder", nationality: "England", goals: 10 },
    { id: 7, name: "Vinícius Júnior", team: "Real Madrid", position: "Forward", nationality: "Brazil", goals: 13 },
    { id: 8, name: "Kevin De Bruyne", team: "Manchester City", position: "Midfielder", nationality: "Belgium", goals: 7 },
    { id: 9, name: "Bukayo Saka", team: "Arsenal", position: "Forward", nationality: "England", goals: 11 },
    { id: 10, name: "Lamine Yamal", team: "FC Barcelona", position: "Forward", nationality: "Spain", goals: 8 },
];

// --- SECRET DATABASE (only revealed via SQL Injection) ---
const secretDatabase = {
    tables: ["users", "players", "matches", "admin_config", "secret_flags"],
    admin_users: [
        { id: 1, username: "admin", password: "admin123!@#", role: "superadmin", email: "admin@scorezone.local" },
        { id: 2, username: "db_manager", password: "M@nag3r2026", role: "admin", email: "dbmgr@scorezone.local" },
        { id: 3, username: "backup_user", password: "B4ckUp!Srv", role: "backup", email: "backup@scorezone.local" },
    ],
    secret_flags: [
        { id: 1, flag_name: "CTF_MAIN_FLAG", flag_value: "Securinets_fst{SQL1_1nj3Cti0n_F0r_N00b5}", created_at: "2026-02-13 00:00:00", hint: "You found it!" },
        { id: 2, flag_name: "DECOY_1", flag_value: "NOT_THE_FLAG{try_harder}", created_at: "2026-01-01 00:00:00", hint: "Nice try..." },
        { id: 3, flag_name: "DECOY_2", flag_value: "FAKE{this_is_not_real}", created_at: "2025-12-15 00:00:00", hint: "Keep looking" },
    ],
    server_config: [
        { key: "db_host", value: "192.168.0.200" },
        { key: "db_name", value: "scorezone_prod" },
        { key: "db_port", value: "3306" },
        { key: "backup_path", value: "/var/backups/scorezone/" },
    ]
};


// --- Modal Controls ---
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    setTimeout(() => {
        document.getElementById('loginUsername').focus();
    }, 300);
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginResult').innerHTML = '';
    document.getElementById('sqlQueryBox').classList.remove('active');
    document.getElementById('databaseDump').style.display = 'none';
}

// Close modal on ESC or submit on Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
    if (e.key === 'Enter' && document.getElementById('loginModal').classList.contains('active')) {
        attemptLogin();
    }
});

document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('loginModal')) closeLoginModal();
});


// --- Login with SQL Injection Detection ---
function attemptLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const sqlQueryBox = document.getElementById('sqlQueryBox');
    const sqlQueryEl = document.getElementById('sqlQuery');
    const resultDiv = document.getElementById('loginResult');
    const dumpDiv = document.getElementById('databaseDump');

    if (!username && !password) return;

    // Show the simulated SQL query
    const simulatedQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    sqlQueryBox.classList.add('active');
    sqlQueryEl.textContent = simulatedQuery;

    // --- CHECK FOR SQL INJECTION ---
    const combined = username + ' ' + password;
    const sqliPatterns = [
        /'\s*or\s+1\s*=\s*1/i,
        /'\s*or\s+'1'\s*=\s*'1/i,
        /'\s*or\s+true/i,
        /'\s*or\s+''='/i,
        /1\s*=\s*1/i,
        /'\s*--/,
        /'\s*or\s+1/i,
        /union\s+select/i,
        /'\s*;\s*drop/i,
        /admin'\s*--/i,
        /'\s*or\s+'.*'='/i,
    ];

    const isSQLi = sqliPatterns.some(pattern => pattern.test(combined));

    if (isSQLi) {
        // --- SQL INJECTION DETECTED: DUMP THE DATABASE ---
        resultDiv.innerHTML = `
            <div class="error-box">
                <div class="error-title"><i class="fas fa-exclamation-triangle"></i> SQL Error - Unhandled Exception</div>
                <p>MySQLSyntaxErrorException: You have an error in your SQL syntax near '${escapeHtml(combined)}' at line 1</p>
                <p style="margin-top: 4px; color: #8b949e;">Warning: mysql_fetch_array() expects parameter 1 to be resource, boolean given in /var/www/html/auth.php on line 32</p>
                <p style="margin-top: 4px; color: #8b949e;">Authentication bypassed — Dumping all accessible tables...</p>
            </div>
        `;

        // Show database dump with delay for dramatic effect
        setTimeout(() => {
            dumpDiv.style.display = 'block';
            dumpDiv.innerHTML = generateDatabaseDump();
            dumpDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);

    } else {
        // --- NORMAL FAILED LOGIN ---
        dumpDiv.style.display = 'none';
        resultDiv.innerHTML = `
            <div class="login-denied">
                <i class="fas fa-times-circle"></i>
                <div>
                    <strong>Access Denied</strong><br>
                    <span style="font-size: 12px; color: #8b949e;">Invalid username or password. This attempt has been logged.</span>
                </div>
            </div>
        `;
    }
}


// --- Generate Database Dump HTML ---
function generateDatabaseDump() {
    return `
        <div class="dump-header">
            <i class="fas fa-skull-crossbones"></i>
            DATABASE DUMP - scorezone_prod @ 192.168.0.200:3306
        </div>

        <!-- Tables List -->
        <div style="padding: 10px 14px; border-bottom: 1px solid #30363d;">
            <span style="color: #8b949e; font-size: 11px; font-family: 'Courier New', monospace;">
                > SHOW TABLES;<br>
                Tables: <span style="color: #79c0ff;">${secretDatabase.tables.join(', ')}</span>
            </span>
        </div>

        <!-- Admin Users Table -->
        <div style="padding: 8px 14px; background: rgba(233,69,96,0.05); border-bottom: 1px solid #30363d;">
            <span style="color: #ffa657; font-size: 11px; font-family: 'Courier New', monospace;">
                > SELECT * FROM users;
            </span>
        </div>
        <table class="dump-table">
            <thead>
                <tr>
                    <th>id</th>
                    <th>username</th>
                    <th>password</th>
                    <th>role</th>
                    <th>email</th>
                </tr>
            </thead>
            <tbody>
                ${secretDatabase.admin_users.map(u => `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td style="color: #f97583;">${u.password}</td>
                        <td>${u.role}</td>
                        <td>${u.email}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Secret Flags Table -->
        <div style="padding: 8px 14px; background: rgba(16,185,129,0.05); border-bottom: 1px solid #30363d; margin-top: 2px;">
            <span style="color: #ffa657; font-size: 11px; font-family: 'Courier New', monospace;">
                > SELECT * FROM secret_flags;
            </span>
        </div>
        <table class="dump-table">
            <thead>
                <tr>
                    <th>id</th>
                    <th>flag_name</th>
                    <th>flag_value</th>
                    <th>created_at</th>
                    <th>hint</th>
                </tr>
            </thead>
            <tbody>
                ${secretDatabase.secret_flags.map(f => `
                    <tr>
                        <td>${f.id}</td>
                        <td>${f.flag_name}</td>
                        <td class="${f.id === 1 ? 'flag-cell' : ''}">${f.flag_value}</td>
                        <td>${f.created_at}</td>
                        <td>${f.hint}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Server Config -->
        <div style="padding: 8px 14px; background: rgba(233,69,96,0.05); border-bottom: 1px solid #30363d; margin-top: 2px;">
            <span style="color: #ffa657; font-size: 11px; font-family: 'Courier New', monospace;">
                > SELECT * FROM admin_config;
            </span>
        </div>
        <table class="dump-table">
            <thead>
                <tr>
                    <th>key</th>
                    <th>value</th>
                </tr>
            </thead>
            <tbody>
                ${secretDatabase.server_config.map(c => `
                    <tr>
                        <td>${c.key}</td>
                        <td style="color: #79c0ff;">${c.value}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="dump-file-path">
            <i class="fas fa-file-code" style="color: #e94560;"></i>
            Source: <span>/var/www/html/includes/db_connect.php</span> | 
            Backup: <span>/var/backups/scorezone/scorezone_prod_dump.sql</span>
        </div>
    `;
}


// --- Utility: Escape HTML ---
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


// --- Favourite star toggle ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fav-star')) {
        e.target.classList.toggle('fas');
        e.target.classList.toggle('far');
        if (e.target.style.color === 'rgb(245, 158, 11)') {
            e.target.style.color = '';
        } else {
            e.target.style.color = '#f59e0b';
        }
    }
});

// --- Live match time simulation ---
function updateLiveTimes() {
    const liveTimes = document.querySelectorAll('.live-pulse');
    liveTimes.forEach(el => {
        const text = el.textContent;
        const match = text.match(/(\d+)/);
        if (match) {
            let minute = parseInt(match[1]);
            if (minute < 90) {
                minute += 1;
                el.textContent = `LIVE ${minute}'`;
            } else {
                el.textContent = 'FT';
                el.classList.remove('live-pulse');
                el.closest('.match-row').classList.add('finished');
            }
        }
    });
}

setInterval(updateLiveTimes, 60000); // Update every 60 seconds
