const express = require('express');
const ClipsApi = require('./modules/api/clips');
const AuthenticationAPI = require('./modules/api/authentication');
const Authenticator = require('./modules/authenticator');
const IOCameraStream = require('./modules/cameraStream');

class WebServer {
    constructor(port, password, streams) {
        this.authenticator = new Authenticator(password);
        this.app = express();
        this.port = port;
        this.streams = streams;

        //parse json in body
        this.app.use(express.json());

        //set up static html serving
        this.app.use(express.static('public'));

        //set up camera streams
        //new WebCameraStream(this.app, this.authenticator)

        //set up clip serving
        this.app.use(
            '/clips',
            this.authenticator.checkTokenRouter.bind(this.authenticator),
            express.static('clips')
        );

        //set up clips api
        new ClipsApi(this.app, this.authenticator);

        //set up authentication api
        new AuthenticationAPI(this.app, this.authenticator);
    }
    start() {
        this.server = this.app.listen(this.port);
        new IOCameraStream(this.server, this.authenticator, this.streams);
    }
}

module.exports = WebServer;
