const { spawnSync, spawn } = require('child_process');

function getCameras() {
    const { stderr } = spawnSync('ffmpeg', [
        '-stats',
        '-hide_banner',
        '-list_devices',
        'true',
        '-f',
        'dshow',
        '-i',
        'dummy',
    ]);
    const devices = stderr.toString('utf8').split('\r\n'); //array of devices

    let cameras = []; //devices accepted as cameras
    let isVideo = false;
    for (let device of devices) {
        if (isVideo) {
            let deviceID = device.split(']   Alternative name "')[1].split('"')[0];
            cameras.push(deviceID);
            isVideo = false;
        } else {
            if (!device.toLowerCase().includes('(video)')) continue; // this is not a video device.
            isVideo = true;
        }
    }

    return cameras;
}

// SOI and EOI explanation: https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format#File_format_structure
const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);
const Frame = require('./frame');
const jpeg = require('jpeg-js');

class CameraStream {
    constructor(deviceID, width, height) {
        let args = [
            '-f',
            'dshow', // input format (DirectShow)
            '-i',
            `video=${deviceID}`, // input device (camera)
            '-f',
            'mpjpeg', // output format
            '-r',
            '30',
        ];

        if (width && height) {
            args.push('-filter:v', `scale=${width}:${height}`); //downscale
        }

        args.push('-'); // output to stdout

        this.process = spawn('ffmpeg', args);
        /*
        this.process.stderr.on('data', (data) => {
            console.log(data.toString());
        });*/
    }

    handleDataChunks(chunk, chunks, callback) {
        const endOfImageMarkerPosition = chunk.indexOf(EOI);
        const startOfImageMarkerPosition = chunk.indexOf(SOI);
        if (chunks[0] && chunks[0].indexOf(SOI) > -1) {
            //if we have a chunk, and the start of the image can be found
            if (endOfImageMarkerPosition === -1) {
                // there was no end of image - add it to our list of chunks
                chunks.push(chunk);
            } else {
                // EOI is within the current chunk. add all data before marker to the chunks array.
                // concat all the buffers in the chunks array and send the full frame

                const endChunk = chunk.slice(0, endOfImageMarkerPosition + 2);
                if (endChunk.length) {
                    //just to be safe
                    chunks.push(endChunk);
                }
                if (chunks.length) {
                    //just to be safe
                    let frameData = Buffer.concat(chunks);
                    callback(frameData);
                }
                // Reset chunks, we just got rid of the frame
                chunks = [];
            }
        }
        if (startOfImageMarkerPosition > -1) {
            // SOI is within the current chunk, reset old chunk data and all data after the marker
            chunks = [];
            const startingChunk = chunk.slice(startOfImageMarkerPosition);
            chunks.push(startingChunk);
        }

        return chunks;
    }

    registerOnData(callback) {
        //cleaner code
        this.process.stdout.on('data', callback);
        return callback;
    }

    deregisterOnData(callback) {
        this.process.stdout.off('data', callback);
    }

    registerOnDecodedFrame(callback) {
        //helper function to deal with ffmpeg and json
        return this.registerOnFrame((frame) => {
            var { width, height, data } = jpeg.decode(frame, { useTArray: true });
            callback(new Frame(width, height, data));
        });
    }

    registerOnFrame(callback) {
        //helper function to deal with ffmpeg
        let chunks = [];
        return this.registerOnData((data) => {
            chunks = this.handleDataChunks(data, chunks, callback); //handle ffmpeg bullshittery
        });
    }
}

class VideoEncoder {
    constructor(fps = 30) {
        this.fps = fps;
        this.process = null;
    }

    start(outputPath) {
        const args = [
            '-y', // overwrite output file without asking
            '-f',
            'mjpeg', // input format: image stream
            '-i',
            '-', // read input from stdin
            '-c:v',
            'libx264', // video codec
            '-r',
            '30',
            outputPath, // output file path
        ];

        this.process = spawn('ffmpeg', args);

        this.process.on('error', (error) => {
            console.error(`FFmpeg error: ${error.message}`);
        });
    }

    async encode(frames) {
        if (!this.process) {
            throw new Error('VideoEncoder not started');
        }

        for (const frame of frames) {
            this.process.stdin.write(frame);
        }
    }

    stop() {
        this.process.stdin.end();
    }
}

module.exports = {
    getCameras,
    CameraStream,
    VideoEncoder,
};
