// Yellowstone Example.
//
// Connects to the specified RTSP server url,
// Once connected, opens a file and streams H264 and AAC to the files
//
// Yellowstone is written in TypeScript. This example uses Javascript and
// the typescript compiled files in the ./dist folder

import { RTSPClient, H264Transport } from 'yellowstone';
import fs from 'fs';
import { exit } from 'process';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

import dotenv from "dotenv";
dotenv.config();

// User-specified details here.
const url = process.env.RTSP_STREAM_URL;
//const filename = "bigbuckbunny";
const username = null;
const password = null;

const filename = path.resolve(__dirname, 'bigbuckbunny');

// Step 1: Create an RTSPClient instance
const client = new RTSPClient(username, password);

import { Writable } from 'stream';

class MyWritableStream extends Writable {
    constructor(options) {
        // Initialize the parent class
        super(options);
    }

    // Implement the _write method
    _write(chunk, encoding, callback) {
        // Process the chunk
        console.log('Writing:', chunk.length);

        // Call the callback when done
        callback();
    }
}

// Step 2: Connect to a specified URL using the client instance.
//
// "keepAlive" option is set to true by default
// "connection" option is set to "udp" by default.
client.connect(url, { connection: "tcp" })
    .then(async (detailsArray) => {
        console.log("Connected 123", detailsArray);

        /* if (detailsArray.length == 0) {
            console.log("ERROR: There are no compatible RTP payloads to save to disk");
            exit();
        }

        for (let x = 0; x < detailsArray.length; x++) {
            let details = detailsArray[x];
            console.log(`Stream ${x}. Codec is`, details.codec);

            // Step 3: Open the output file
            if (details.codec == "H264") {

            }
            if (details.codec == "H265") {
                console.log('H265 codec not supported yet.');
            }
            if (details.codec == "AAC") {
                console.log('AAC codec not supported yet.');
            }
        } */

        //const videoFile = fs.createWriteStream(filename + '.264');
        const videoStream = new MyWritableStream({ highWaterMark: 1024 });
        // Step 4: Create H264Transport passing in the client, file, and details
        // This class subscribes to the client 'data' event, looking for the video payload
        const h264 = new H264Transport(client, videoStream, detailsArray);

        // Step 5: Start streaming!
        await client.play();
        console.log("Play sent");

    })
    .catch(e => console.log(e));

// The "data" event is fired for every RTP packet.
client.on("data", (channel, data, packet) => {
    //console.log("RTP:", "Channel=" + channel, "TYPE=" + packet.payloadType, "ID=" + packet.id, "TS=" + packet.timestamp, "M=" + packet.marker);
});

// The "controlData" event is fired for every RTCP packet.
client.on("controlData", (channel, rtcpPacket) => {
    //console.log("RTCP:", "Channel=" + channel, "TS=" + rtcpPacket.timestamp, "PT=" + rtcpPacket.packetType);
});

// The "log" event allows you to optionally log any output from the library.
// You can hook this into your own logging system super easily.

client.on("log", (data, prefix) => {
    //console.log(prefix + ": " + data);
});