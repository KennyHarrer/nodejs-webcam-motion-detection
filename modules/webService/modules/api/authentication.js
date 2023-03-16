const express = require('express');

class AuthenticationAPI {
    constructor(app, authenticator) {
        this.app = app;
        this.authenticator = authenticator;
        this.router = express.Router();

        this.router.post('/authorize', this.authenticator.authorizeRouter.bind(this.authenticator));

        this.router.post(
            '/test',
            this.authenticator.checkTokenRouter.bind(this.authenticator),
            (req, res) => res.status(200).send('ok')
        );

        this.app.use('/api/authentication', this.router);
    }
}

module.exports = AuthenticationAPI;
