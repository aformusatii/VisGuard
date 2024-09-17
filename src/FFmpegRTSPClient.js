import {PassThrough} from "stream";
import ffmpeg from "fluent-ffmpeg";

export default class FFmpegRTSPClient {

    connect(streamUrl, writeCallback) {
        this.writeCallback = writeCallback;

        this.passThroughStream = new PassThrough();
        this.passThroughStream.on('data', this.onData.bind(this));
        this.passThroughStream.on('end', this.onEnd.bind(this));
        this.passThroughStream.on('error', this.onError.bind(this));

        this.ffmpegCommand = ffmpeg(streamUrl)
            .inputOptions('-rtsp_transport tcp')
            .noAudio() // Do not include audio
            .videoCodec('copy')
            .format('h264') // Output in H264 format
            .on('start', cmd => console.log('FFmpeg started:', cmd))
            .on('end', () => {
                console.log('FFmpeg process ended');
                this.passThroughStream.end();
            })
            .on('error', err => {
                console.error('FFmpeg error:', err.message);
                this.passThroughStream.end();
            });

        // Pipe the ffmpeg output to the passThroughStream and capture the process reference
        this.ffmpegCommand.pipe(this.passThroughStream, { end: true }).on('finish', () => {
            console.log('Piping finished');
        });
    }

    onData(chunk) {
        this.writeCallback(chunk);
    }

    onEnd() {
        console.log('FFmpegRTSPClient: Stream ended');
    }

    onError(err) {
        console.log('FFmpegRTSPClient: Stream error', err.message);
    }

    disconnect() {
        try {
            this.ffmpegCommand.ffmpegProc.stdin.write('q');
        } catch (ex) {
            console.log('FFmpegRTSPClient: Exception on disconnect:', ex);
        }
    }

}