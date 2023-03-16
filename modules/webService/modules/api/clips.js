const { readdir, rename, unlink: deleteFile } = require('fs/promises');
const express = require('express');

class ClipsAPI {
    constructor(app, authentication) {
        this.app = app;

        this.router = express.Router();

        this.router.use(authentication.checkTokenRouter.bind(authentication)); //always check for authorization

        this.router.delete('/delete', this.deleteClip);

        this.router.get('/', this.getAllClips);

        this.router.put('/rename', this.renameClip);

        //use the clips api router

        this.app.use('/api/clips', this.router);
    }

    async deleteClip(req, res) {
        const { clipname: clipName } = req.query || {};
        if (!clipName) return res.status(400).send('no clipname provided');
        try {
            await deleteFile('./clips/' + clipName);
        } catch (e) {
            return res.status(404).send('clip not found');
        }

        res.status(200).send('clip deleted');
    }

    async renameClip(req, res) {
        const { clipname: clipName, newclipname: newClipName } = req.query || {};
        if (!clipName || !newClipName)
            return res.send(400).send('no clipname provided, or no newclipname provided.');

        try {
            await rename('./clips/' + clipName, './clips/' + newClipName);
        } catch (e) {
            return res.status(404).send('clip not found');
        }

        res.status(200).send('clip renamed');
    }

    async getAllClips(req, res) {
        res.status(200).json(await readdir('./clips/'));
    }
}

module.exports = ClipsAPI;
