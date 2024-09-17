import {H264Transport, RTSPClient} from "yellowstone";
import {Writable} from "stream";

export default class YellowstoneRTSPClient {

    connect(streamUrl, writeCallback) {
        this.writeCallback = writeCallback;

        this.client = new RTSPClient();
        this.client.connect(streamUrl, { connection: "tcp" })
            .then(this.onConnect.bind(this))
            .catch(e => console.log(e));
    }

    async onConnect(details) {
        console.log("VideoRTSPClient->details", details);

        this.client._client.on('error', (err) => {
            console.log('socket error, probably closed!!!');
        });

        this.videoStream = new VideoWritableStream({highWaterMark: 15000}, this.writeCallback);
        this.h264 = new H264Transport(this.client, this.videoStream, details);
        try {
            await this.client.play();
        } catch (ex) {
            console.log('Exception on RTSPClient play:', ex);
        }
    }

    disconnect() {
        const $this = this;

        (async function() {
            try {
                if ($this.videoStream) {
                    $this.videoStream.end();
                }
                await $this.client.close(true);
            } catch (ex) {
                console.log('Exception on RTSPClient close:', ex);
            }
        })();
    }

}

class VideoWritableStream extends Writable {

    constructor(options, writeCallback) {
        // Initialize the parent class
        super(options);
        this.writeCallback = writeCallback;

        this.bufferSize = 1000;
        this.buffer = [];
        this.currentBufferSize = 0;
    }

    // Implement the _write method
    _write(chunk, encoding, callback) {

        // Add the chunk to the buffer
        this.buffer.push(chunk);
        this.currentBufferSize += chunk.length;

        // Check if the buffer size has been reached
        if (this.currentBufferSize >= this.bufferSize) {
            // Flush the buffer
            this.flushBuffer();
        }

        // Call the callback when done
        callback();
    }

    flushBuffer() {
        // Aggregate the buffer chunks into a single Buffer
        const aggregatedData = Buffer.concat(this.buffer, this.currentBufferSize);

        // Call the writeCallback with the aggregated data
        this.writeCallback(aggregatedData);

        // Clear the buffer and reset the current buffer size
        this.buffer = [];
        this.currentBufferSize = 0;
    }

    _final(callback) {
        // Flush the remaining buffer when the stream ends
        if (this.currentBufferSize > 0) {
            this.flushBuffer();
        }
        // Signal that the stream has ended
        callback();
    }
}