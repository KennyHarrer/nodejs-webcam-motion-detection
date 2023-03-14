const { getCameras, CameraStream } = require('./modules/ffmpeg');
const MotionDetector = require('./modules/motionDetection');
const DVR = require('./modules/DVR');
const path = require('path');

const debounceTime = 1 * 1000; //1 seconds

(() => {
    let cameras = getCameras();
    let streams = [];
    for (let [cameraNumber, camera] of Object.entries(cameras)) {
        let stream = new CameraStream(camera, 320, 240);
        streams.push(stream);
        let dvr = new DVR(stream, 50);

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
                        'dvr',
                        Date.now() + '_' + cameraNumber + '_' + distance + '.mp4'
                    );
                    dvr.start(outputPath);
                    console.log('motion detected, started recording', outputPath);
                }
                if (dvrTimeout) clearTimeout(dvrTimeout);
                dvrTimeout = setTimeout(() => {
                    dvr.stop();
                    console.log('motion not detected for 5 seconds dvr stopping...');
                }, 5000);
            });
        }, 3000);
    }
})();
