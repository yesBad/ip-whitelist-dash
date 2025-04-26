"use strict";

const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const { config, port, redirectee, categories, activeCategory } = require("./config");
const app = express();
const fs = require('fs');
const path = require('path');
const normies = path.join(__dirname, '../traefik/dyn-whitelist.toml');
const specials = path.join(__dirname, '../traefik/special-whitelist.toml');

function updateTraefikConfig(updates, configPath) {
    let config = fs.readFileSync(configPath, 'utf-8');
    const ipRegex = /sourceRange\s*=\s*\[(.*?)\]/s;
    const commentRegex = /#\s*(.*)/g;
    let currentIPs = [];
    let currentComments = [];

    if (ipRegex.test(config)) {
        currentIPs = ipRegex.exec(config)[1].split(',').map(ip => ip.trim().replace(/["']/g, ''));
    }
    config.replace(commentRegex, (_, comment) => currentComments.push(comment.trim()));

    const existingData = {};
    currentComments.forEach((username, index) => {
        existingData[username] = currentIPs[index];
    });

    for (const [username, ip] of updates) {
        if (username) existingData[username] = ip;
    }

    const newIPs = [];
    const newComments = [];

    for (const [username, ip] of Object.entries(existingData)) {
        newIPs.push(ip);
        newComments.push(`# ${username}`);
    }

    const updatedIPList = `sourceRange = [${newIPs.map(ip => `"${ip}"`).join(', ')}]`;
    const updatedComments = newComments.join('\n');

    config = config.replace(ipRegex, updatedIPList);
    config = updatedComments + '\n' + config.replace(/#.*\n/g, '');

    fs.writeFileSync(configPath, config, 'utf-8');
}

app.use(auth(config));
app.set('views', './views')
app.set('view engine', 'pug');

app.get('/categories/:category', requiresAuth(), (req, res) => {
    const category = req.params.category;
    const { Admin, ...tempCat } = categories;
    if(req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) { res.json(categories[category] || []); return; }
    res.json(tempCat[category] || []);
});

app.get('/', requiresAuth(), (req, res) => {
    try {
        if (!req?.oidc?.accessToken) return;
        if (req.headers["x-real-ip"] == req.headers["x-forwarded-for"]) {
            console.log(`[${req.headers["x-real-ip"]}] [${req?.oidc?.idTokenClaims?.groups.includes("dash_admin")}] ${req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()} visited /`);
            if(req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) {
                let arr = []; arr.push([req?.oidc?.idTokenClaims?.preferred_username.toLowerCase(), req.headers["x-real-ip"]]);
                updateTraefikConfig(arr, specials);
            }
            let arr = []; arr.push([req?.oidc?.idTokenClaims?.preferred_username.toLowerCase(), req.headers["x-real-ip"]]);
            updateTraefikConfig(arr, normies);
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


app.get('/dash', requiresAuth(), (req, res) => {
    const { Admin, ...tempCat } = categories;
    console.log(`[${req.headers["x-real-ip"]}] [${req?.oidc?.idTokenClaims?.groups.includes("dash_admin")}] ${req?.oidc?.idTokenClaims?.preferred_username.toLowerCase()} visited /dash `);
    if(req?.oidc?.idTokenClaims?.groups.includes("dash_admin")) { res.render('index', { activeCategory, categories }); return; }
    res.render('index', { activeCategory, categories: tempCat });
});
app.use('/public', express.static('public'));

app.listen(port, function () {
    console.log(`Base is listening on ${port}.`)
});