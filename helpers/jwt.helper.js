const expressJwt = require('express-jwt');

//express-jwt is used to secure the API of the server
function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            //  Below Path can be accessible by anyone!
            //  Excluding JWT authorization on these path
            `${api}/users/login`, 
            `${api}/users/register`,

            //  By doing this it will allow the user to only READ/GET and not to POST products
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']}, 
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
        ]
    })

    async function isRevoked(req, payload, done){
        //To check whether the User is Admin or NOT
        //NOT Admin
        if(!payload.isAdmin){
            done(null, true);
        }
        //YES Admin
            done();
    }
}

module.exports = authJwt;