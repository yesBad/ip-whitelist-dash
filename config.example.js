const { randomBytes } = require('crypto');
const port = 2500;
const redirectee = "https://url.tld/dash";
const config = {
    authRequired: false,
    baseURL: "https://url.tld",
    secret: randomBytes(64).toString('hex'),
    clientID: "home",
    clientSecret: "!secretycodey!",
    clientAuthMethod: "client_secret_basic",
    issuerBaseURL: "https://auth.url.tld",
    pushedAuthorizationRequests: true,
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email groups',
    },
}

const categories = {
    Main: [
        { feature: "Authelia", icon: "public/img/authelia.png", desc: "authelia very good", url: "https://auth.url.tld/settings" },
    ],
    Admin: [
        { feature: "Sonarr", icon: "public/img/sonarr.png", desc: "Show gatherer 🍿🍫", url: "https://sonarr.url.tld" },
    ],
}
const activeCategory = "Main";

module.exports = { config, port, categories, activeCategory, redirectee };
