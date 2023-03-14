const EventEmitter = require('events');

class MotionDetector extends EventEmitter {
    constructor(cameraStream, sensitivity = 0) {
        super();
        //TODO: ensure process is alive, ensure passed var is actually a process.
        cameraStream.registerOnDecodedFrame(this.frameHandler.bind(this));
        this.sensitivity = sensitivity;
    }

    frameHandler(frame) {
        if (this.lastFrame) {
            const { totalDistance } = frame.compareFrame(this.lastFrame);
            let distanceScaling = frame.width * frame.height * 0.8; //0.8 arbitrarily selected btw
            let distanceScaled = Math.round(totalDistance / distanceScaling);
            if (distanceScaled > this.sensitivity) {
                this.emit('motion', distanceScaled, frame);
            }
        }
        this.lastFrame = frame;
    }
}

module.exports = MotionDetector;
