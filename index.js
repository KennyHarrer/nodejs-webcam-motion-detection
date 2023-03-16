const { getCameras, CameraStream } = require('./modules/ffmpeg');
const MotionDetector = require('./modules/motionDetection');
const DVR = require('./modules/DVR');
const Notifier = require('./modules/notifier');
const path = require('path');
const WebServer = require('./modules/webService');
require('dotenv').config();

const debounceTime = 1 * 1000; //1 seconds

(() => {
    const notifier = new Notifier({
        token: {
            key: './AuthKey.p8',
            keyId: process.env.apnKeyId,
            teamId: process.env.apnTeamId,
        },
        production: true,
    });
    let cameras = getCameras();

    if (cameras.length == 0) {
        console.log('no cameras could be found... exiting...');
        return;
    }
    let streams = [];
    for (let [cameraNumber, camera] of Object.entries(cameras)) {
        let stream = new CameraStream(camera, 1280, 720);
        streams.push({ stream, cameraNumber });
        let dvr = new DVR(stream, 1);

        let motionDetector = new MotionDetector(stream, 5);
        let cooldown = 0;
        let dvrTimeout;
        setTimeout(() => {
            //wait 2 second otherwise we might detect the camera turning on as motion
            console.log('started...');
            motionDetector.on('motion', (distance, frame) => {
                if (cooldown > Date.now()) return;
                cooldown = Date.now() + debounceTime; // set cooldown
                if (!dvr.recording) {
                    let outputPath = path.join(
                        __dirname,
                        'clips',
                        Date.now() + '_' + cameraNumber + '_' + distance + '.mp4'
                    );
                    dvr.start(outputPath);
                    console.log(
                        'motion detected on camera ' +
                            cameraNumber +
                            ' recording started at ' +
                            outputPath
                    );
                    notifier.notify(
                        'Motion Detected on camera ' + cameraNumber,
                        'Saved DVR, started recording',
                        'camera' + cameraNumber
                    );
                }
                if (dvrTimeout) clearTimeout(dvrTimeout);
                dvrTimeout = setTimeout(() => {
                    dvr.stop();
                    console.log('motion not detected for 5 seconds dvr stopping...');
                }, 5000);
            });
        }, 5000);
    }

    const webServer = new WebServer(80, process.env.password, streams);
    webServer.start();
})();
