const { VideoEncoder } = require('../modules/ffmpeg');

class DVR {
    constructor(cameraStream, bufferSizeInMB) {
        //TODO: ensure process is alive, ensure passed var is actually a process.
        this.heapBuffer = [];
        this.bufferSizeInMB = bufferSizeInMB * 1024 * 1024;
        this.encoder = new VideoEncoder();
        this.storeBuffer = false;

        cameraStream.registerOnFrame(this.dataHandler.bind(this));
    }
    getHeapSizeInMB() {
        let buffer = Buffer.from(this.heapBuffer);
        return buffer.length / (1024 * 1024); //1 mb
    }
    dataHandler(data) {
        if (this.recording) {
            this.encoder.encode([data]);
            return;
        }
        if (this.storeBuffer) {
            this.heapBuffer.push(data);
        }
        while (this.getHeapSizeInMB() > this.bufferSizeInMB) {
            //clear room in heap
            this.heapBuffer.shift();
            console.log('cleaning');
        }
    }
    start(outputPath) {
        this.encoder.start(outputPath);
        this.recording = true;
        this.encoder.encode(this.heapBuffer);
        this.heapBuffer = [];
    }
    stop() {
        this.encoder.stop();
        this.recording = false;
    }
}

module.exports = DVR;
