import {WebSocketServer} from 'ws';
import YellowstoneRTSPClient from "./YellowstoneRTSPClient.js";
import FFmpegRTSPClient from "./FFmpegRTSPClient.js";
import config from "./Configuration.js";

export default class VideoWebSocketServer {

    constructor(server) {
        this.server = server;
        const wss = new WebSocketServer({ noServer: true });
        wss.on('connection', this.onConnection.bind(this));

        server.on('upgrade', function (request, socket, head) {
            console.log('server->upgrade!', request.url);

            wss.handleUpgrade(request, socket, head, function (ws) {
                wss.emit('connection', ws, request);
            });
        });
    }

    onConnection(ws, request) {
        new WebSocketClient(ws, request);
    }

}

class WebSocketClient {

    constructor(ws, request) {
        console.log(`New WebSocketClient. Conn Url ${request.url}`);

        this.ws = ws;
        ws.on('message', this.onMessage.bind(this));
        ws.on('error', this.onError.bind(this));
        ws.on('close', this.onClose.bind(this));

        this._startStreaming(request.url, ws);

        console.log('WebSocketClient connected!');
    }

    onMessage(message) {
        const msgStr = message.toString();
        console.log('WebSocket message:', msgStr);

        if (msgStr === 'close') {
            console.log('Close WebSocket!');
            this.ws.close();
        }
    }

    onError() {
        console.log('WebSocket error');
    }

    onClose() {
        console.log('WebSocket close');
        try {
            this.videoRTSPClient.disconnect();
        } catch (ex) {
            console.error('WebSocketClient: Exception on disconnect', ex);
        }
    }

    _startStreaming(requestUrl, ws) {
        const streamUrl = this._getStreamUrl(requestUrl);
        if (streamUrl === null) {
            console.error('WebSocketClient-> Invalid stream url:', requestUrl);
            return;
        }

        console.log(`Trying to open stream: [${streamUrl}]`);

        // this.videoRTSPClient = new YellowstoneRTSPClient();
        this.videoRTSPClient = new FFmpegRTSPClient();
        this.videoRTSPClient.connect(streamUrl, function (chunk) {
            try {
                //console.log(chunk.length);
                ws.send(chunk);
            } catch (ex) {
                console.log(`Exception on write to websocket:`, ex);
            }
        });
    }

    _extractPathParams(path) {
        const parts = path.split('/').filter(Boolean);
        console.log('parts:', parts);

        if (parts.length === 4) {
            return {
              cameraLabel: parts[2],
              stream: parts[3]
            };
        } else {
            console.error('WebSocketClient-> Invalid path:', path);
        }
    }

    _getStreamUrl(streamPath) {
        const params = this._extractPathParams(streamPath);

        const camera = config.camerasMap[params.cameraLabel];
        if (typeof camera === 'undefined') {
            console.error('WebSocketClient-> Camera not found:', params.cameraLabel);
            return null;
        }

        const stream = camera.streams[params.stream];
        if (typeof stream === 'undefined') {
            console.error('WebSocketClient-> Stream not found:', params.stream);
            return null;
        }

        return stream.url;
    }

}