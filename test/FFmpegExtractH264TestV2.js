import ffmpeg from 'fluent-ffmpeg';
import { PassThrough }  from 'stream';
import fs from 'fs';

import dotenv from "dotenv";
dotenv.config();

// Replace with your RTSP stream URL
const rtspUrl = process.env.RTSP_STREAM_URL;

// Create a PassThrough stream to handle the raw data
const passThroughStream = new PassThrough();

const ffmpegCommand = ffmpeg(rtspUrl)
    .inputOptions('-rtsp_transport tcp')
    .noAudio() // Do not include audio
    .videoCodec('copy')
    .format('h264') // Output in H264 format
    .on('start', cmd => console.log('FFmpeg started:', cmd))
    .on('end', () => {
        console.log('FFmpeg process ended');
        passThroughStream.end();
    })
    .on('error', err => {
        console.error('FFmpeg error:', err.message);
        passThroughStream.end();
    });

// Pipe the ffmpeg output to the passThroughStream and capture the process reference
ffmpegCommand.pipe(passThroughStream, { end: true }).on('finish', () => {
    console.log('Piping finished');
});

let ffmpegProcessRef = null;

// Retrieve the ffmpeg process reference
/*ffmpegCommand.ffmpegProc = (proc) => {
    ffmpegProcessRef = proc;
};*/


const fileStream = fs.createWriteStream('output.h264');

// Consume the raw output programmatically
passThroughStream.on('data', chunk => {
    //console.log('Received chunk:', chunk);
    // Add your chunk processing logic here
    fileStream.write(chunk);
});

passThroughStream.on('end', () => {
    console.log('Stream ended');
    fileStream.end(); // Close the file stream
});

passThroughStream.on('error', err => {
    console.error('Stream error:', err.message);
    fileStream.end(); // Close the file stream
});

setTimeout(() => {
    //console.log('ffmpegProcess', ffmpegCommand.ffmpegProc);
    ffmpegCommand.ffmpegProc.stdin.write('q');

    //ffmpegCommand.ffmpegProc.kill('SIGKILL');
    //passThroughStream.end();
}, 10000);
