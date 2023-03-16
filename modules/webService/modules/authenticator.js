/*

Note to everyone who might use this: This secruity is awful. THIS IS MEANT TO BE CHEAP LAN SECRUITY AND SHOULD NOT BE USED PUBLICLY

*/
const { v4: uuidv4 } = require('uuid');

class Authenticator {
    constructor(password, tokenExpireInMinutes = 60) {
        if (!password || password.length < 12) {
            this.password = 'bad'; //prevent bad password usage since the secruity on this is horrible.
        }
        this.password = password;
        this.validTokens = {};
        this.tokenExpiry = tokenExpireInMinutes * 60 * 1000; //by default tokens expire in 1 hour
    }

    generateToken() {
        const token = uuidv4();
        this.validTokens[token] = {
            token,
            expiry: Date.now() + this.tokenExpiry,
        };
        return token;
    }

    authorizeRouter(req, res) {
        if (this.password == 'bad') {
            return res.status(500).send('Server security check failed, authorization unavailable');
        }
        const password = req.body.password;
        if (!password) {
            return res.status(401).send('Unauthorized');
        }
        if (password != this.password) {
            return res.status(403).send('Unauthorized');
        }
        res.status(200).send(this.generateToken());
    }

    checkToken(token) {
        if (!token) {
            return false;
        }
        const tokenInfo = this.validTokens[token];
        if (!tokenInfo) {
            return false;
        }
        if (tokenInfo.expiry <= Date.now()) {
            this.validTokens[token] = undefined; //clean memory
            return false;
        }
        return true;
    }

    checkTokenRouter(req, res, next) {
        const token = req.headers.authorization;
        if (!this.checkToken(token)) return res.status(403).send('Unauthorized');
        next();
    }
}

module.exports = Authenticator;
