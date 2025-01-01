const { randomBytes } = require('crypto');
const port = 2500;
const redirectee = "https://url.tld/index.html";
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
module.exports = { config, port, redirectee };