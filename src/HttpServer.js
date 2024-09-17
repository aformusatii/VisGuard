import express from 'express';
import config from "./Configuration.js";

import path from 'path';
import { fileURLToPath } from 'url';
import VideoRecordController from "./VideoRecordController.js";
import http from "http";
import VideoWebSocketServer from "./VideoWebSocketServer.js";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

class HttpServer {

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.text());

        this.server = http.createServer(this.app);
    }

    _configureStaticVideoFolders() {
        const $this = this;

        config.cameras.forEach((camera) => {
            const videoParentUrl = `/camera/${camera.label}/videos/`;
            const videoFolder = camera.videoRecorder.folderPath;

            console.log('Configure video http endpoint', videoParentUrl, '->', videoFolder);
            $this.app.use(videoParentUrl, express.static(videoFolder));
        });
    }

    _configureVideoRecordController() {
        const videoRecordController = new VideoRecordController();

        this.app.get('/cameras/:camera/records', videoRecordController.getVideoRecords.bind(videoRecordController));
        this.app.get('/cameras/:camera/firstDateTime', videoRecordController.getFirstVideoRecordDateTime.bind(videoRecordController));
    }

    _configureCameraController() {
        this.app.get('/cameras', function(req, res) {
            res.json(config.cameras);
        });
    }

    initialize() {
        const webFolder = path.join(__dirname, '..', 'static');
        this.app.use(express.static(webFolder));

        this._configureStaticVideoFolders();
        this._configureVideoRecordController();
        this._configureCameraController();

        const PORT = config.httpServer.port;

        new VideoWebSocketServer(this.server);

        //this.app.listen(PORT, () => console.log(`Web Server listening on port: ${PORT}`));
        this.server.listen(PORT, () => console.log(`Web Server listening on port: ${PORT}`));
    }

    getExpressApp() {
        return this.app;
    }

}

const httpServerInstance = new HttpServer();
httpServerInstance.initialize();

export default httpServerInstance;