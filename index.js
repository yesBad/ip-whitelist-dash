"use strict";

const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const { config, port, redirectee, categories, activeCategory } = require("./config");
const app = express();
const fs = require('fs');
const path = require('path');
const normies = path.join(__dirname, '../traefik/dyn-whitelist.toml');
const specials = path.join(__dirname, '../traefik/special-whitelist.toml');

function updateOrRemoveTraefikConfig({ update = null, remove = null }, configPath) {
    let config = fs.readFileSync(configPath, 'utf-8');

    const sourceRangeRegex = /((?:^\s*#.*\n)*)^\s*(sourceRange\s*=\s*\[(.*?)\])/m;

    const match = config.match(sourceRangeRegex);
    if (!match) {
        throw new Error('sourceRange block not found.');
    }

    const fullCommentBlock = match[1] || '';
    const ipListRaw = match[3] || '';

    const usernames = fullCommentBlock
        .split('\n')
        .filter(line => line.trim().startsWith('#'))
        .map(line => line.trim().slice(1).trim());

    const ips = ipListRaw
        .split(',')
        .map(ip => ip.trim().replace(/['"]/g, ''))
        .filter(ip => ip.length > 0);

    if (usernames.length !== ips.length) {
        if (usernames.length > 0 || ips.length > 0) {
            throw new Error('Mismatch between number of usernames and IPs.');
        }
    }

    const existingData = {};
    usernames.forEach((username, idx) => {
        existingData[username] = ips[idx];
    });

    if (update) {
        const [username, ip] = update;
        existingData[username] = ip;
    }

    if (remove) {
        delete existingData[remove];
    }

    const newUsernames = Object.keys(existingData);
    const newIPs = Object.values(existingData);

    let newBlock = '';

    if (newUsernames.length > 0) {
        const newComments = newUsernames.map(username => `# ${username}`).join('\n');
        const newSourceRange = `sourceRange = [${newIPs.map(ip => `"${ip}"`).join(', ')}]`;
        newBlock = `${newComments}\n${newSourceRange}`;
    } else {
        newBlock = `sourceRange = []`;
    }

    const updatedConfig = config.replace(sourceRangeRegex, newBlock);

    fs.writeFileSync(configPath, updatedConfig, 'utf-8');
}


app.use(auth(config));
app.set('views', './views')
app.set('view engine', 'pug');

app.get('/categories/:category', requiresAuth(), (req, res) => {
    const category = req.params.category;
    const { Admin, ...tempCat } = categories;
    if (req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) { res.json(categories[category] || []); return; }
    res.json(tempCat[category] || []);
});

app.get('/', requiresAuth(), (req, res) => {
    try {
        if (!req?.oidc?.accessToken) return;
        if (req.headers["x-real-ip"] == req.headers["x-forwarded-for"]) {
            console.log(`[${req.headers["x-real-ip"]}] [${req?.oidc?.idTokenClaims?.groups.includes("dash_admin")}] ${req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()} visited /`);
            if (req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) {
                let arr = [req?.oidc?.idTokenClaims?.preferred_username.toLowerCase(), req.headers["x-real-ip"]];
                updateOrRemoveTraefikConfig({
                    update: arr
                }, specials);
            }
            let arr = [req?.oidc?.idTokenClaims?.preferred_username.toLowerCase(), req.headers["x-real-ip"]];
            updateOrRemoveTraefikConfig({
                update: arr
            }, normies);
            res.redirect(redirectee);
        }
    } catch (e) { console.warn(e) }
});

app.get('/403', (req, res) => {
    try {
        if (req?.oidc?.accessToken) {
            res.redirect(redirectee);
            return;
        };
        res.send(`
<html>
<head>
<meta http-equiv="refresh" content="0; url=${config.baseURL}" />
</head>
<body style="background-color: #000;>
<p><a href="${config.baseURL}">No permission, login again?</a></p>
</body>
</html>
`)
    } catch (e) { console.warn(e) }
});

app.get('/del-ip', requiresAuth(), (req, res) => {
    try {
        if (req?.oidc?.accessToken) {
            if (req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) {
                updateOrRemoveTraefikConfig({
                    remove: req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()
                }, specials);
            }
            updateOrRemoveTraefikConfig({
                remove: req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()
            }, normies);
            res.redirect("/dash");
        };
    } catch (e) { console.warn(e) }
});

app.get('/dash', requiresAuth(), (req, res) => {
    const { Admin, ...tempCat } = categories;
    console.log(`[${req.headers["x-real-ip"]}] [${req?.oidc?.idTokenClaims?.groups.includes("dash_admin")}] ${req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()} visited /dash `);
    if (req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) { res.render('index', { activeCategory, categories }); return; }
    res.render('index', { activeCategory, categories: tempCat });
});

app.use('/public', express.static('public'));

app.listen(port, function () {
    console.log(`Base is listening on ${port}.`)
});
