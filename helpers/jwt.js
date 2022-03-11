const expressJwt = require("express-jwt");

// Handles tokens
function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked,
    }).unless({
        // Allows users to use certain APIs without logging in
        path: [
            { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
            {
                url: /\/api\/v1\/productcategories(.*)/,
                methods: ["GET", "OPTIONS"],
            },
            `${api}/users/login`,
            `${api}/users/register`,
            `${api}/users/register`,
        ],
    });
}

// Makes sure people cannot make DELETE requests after they login
async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);
    }

    done();
}

module.exports = authJwt;
