//basically sets up the socket io server

class IOCameraStream {
    constructor(server, authenticator, cameraStreams) {
        this.io = require('socket.io')(server);

        this.io.on('connection', (socket) => {
            var registerFunctions = {};
            var authenticated = false;
            socket.once('authenticate', (token) => {
                if (!authenticator.checkToken(token)) return;
                authenticated = true;
                socket.emit('authenticated');
            });
            socket.on('getCameras', () => {
                if (!authenticated) return;
                let numbers = [];
                for (let { cameraNumber } of cameraStreams) {
                    numbers.push(cameraNumber);
                }

                socket.emit('cameras', numbers);
            });
            socket.on('subscribeCamera', (cameraNumber) => {
                if (!authenticated) return;
                if (registerFunctions[cameraNumber]) return;
                registerFunctions[cameraNumber] = cameraStreams[
                    cameraNumber
                ].stream.registerOnDecodedFrame((frame) => {
                    // send the frame data to the client
                    socket.emit(
                        'cameraFrame',
                        cameraNumber,
                        frame.frameData,
                        frame.width,
                        frame.height
                    );
                });
            });
            socket.on('disconnect', () => {
                if (registerFunctions) {
                    for (let [cameraNumber, func] of Object.entries(registerFunctions)) {
                        cameraStreams[cameraNumber].stream.deregisterOnData(func);
                    }
                }
                console.log('socket disconnec');
            });
        });
    }
}

module.exports = IOCameraStream;
