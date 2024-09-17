import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export default class VideoRecorder {

    constructor(camera) {
        this.camera = camera;
        this.used = false;
    }

    startRecording() {
        if (this.used) {
            console.error('VideoRecorder already used!');
            return;
        }

        this.used = true;

        const fileName = this.createFileName();
        const outputFilePath = path.join(this.camera.videoRecorder.folderPath, fileName);

        const inputStream = this.camera.videoRecorder.inputStream;
        const streamUrl = this.camera.streams[inputStream].url;

        console.log('Starting recording: ', streamUrl, ' to ', outputFilePath);

        const $this = this;
        this.onEnd = () =>{};

        this.ffmpegProcess = ffmpeg(streamUrl)
            .audioCodec('copy')
            .videoCodec('copy')
            .on('end', () => {
                console.log('Processing finished!');
                $this.onEnd();
            }).on('error', (err) => {
                console.error('Error: ', err.message);
            }).save(outputFilePath);

        return outputFilePath;
    }

    async stopRecording() {
        const $this = this;

        return new Promise((resolve, reject) => {
            const forceStop = function() {
                // force kill ffmpeg by PID
                try {
                    $this.ffmpegProcess.ffmpegProc.kill('SIGKILL');
                } catch (e) {
                    console.error('Error stopping recording: ', e);
                }

                resolve();
            };

            const timeoutTimer = setTimeout(forceStop, 60000);

            $this.onEnd = () => {
                clearTimeout(timeoutTimer);
                resolve();
            }

            try {
                $this.ffmpegProcess.ffmpegProc.stdin.write('q');
            } catch (e) {
                console.error('Error stopping recording: ', e);
                resolve();
            }
        });
    }

    createFileName() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        return `video-${year}_${month}_${day}_${hour}-${minute}-${second}-${milliseconds}.mp4`;
    }

}