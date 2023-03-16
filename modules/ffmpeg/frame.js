const jpeg = require('jpeg-js');
const { writeFile } = require('fs/promises');

class Frame {
    constructor(width, height, frameData) {
        this.frameData = frameData;
        this.width = width;
        this.height = height;
    }
    readPixel(pixelNumber) {
        pixelNumber = pixelNumber * 4;
        return {
            red: this.frameData[pixelNumber],
            green: this.frameData[pixelNumber + 1],
            blue: this.frameData[pixelNumber + 2],
            alpha: this.frameData[pixelNumber + 3],
        };
    }
    compareFrame(otherFrame) {
        let originalPixelCount = this.frameData.length / 4; //r, g, b per pixel so arr/3 == number of pixels
        let newPixelCount = otherFrame.frameData.length / 4;
        if (originalPixelCount != newPixelCount) {
            //something is obviously wrong
            throw new Error('non matching pixel count ' + originalPixelCount + ' ' + newPixelCount);
        }
        if (originalPixelCount % 1 != 0 || newPixelCount % 1 != 0) {
            //something is obviously wrong
            throw new Error('non even pixel count (wrong pixel format?)');
        }
        let distanceArray = new Uint8Array(originalPixelCount); //basically a heat map of differences
        let totalDistance = 0; //total amount of difference in the image

        for (let pixel = 0; pixel < originalPixelCount; pixel++) {
            let { red: r1, green: g1, blue: b1 } = this.readPixel(pixel);
            let { red: r2, green: g2, blue: b2 } = otherFrame.readPixel(pixel);

            const distance =
                Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)) || 0;

            totalDistance += distance || 0; //honestly not sure whats up with this, but it fixed total distance being nan so... lol

            distanceArray[pixel] = distance; //update heat map
        }
        return {
            distanceArray,
            totalDistance,
        };
    }
    encode() {
        return jpeg.encode({
            data: this.frameData,
            width: this.width,
            height: this.height,
            useTArray: true,
            formatAsRGBA: false,
        });
    }
    async saveTo(saveLocation) {
        writeFile(saveLocation, this.encode().data);
    }
}

module.exports = Frame;
