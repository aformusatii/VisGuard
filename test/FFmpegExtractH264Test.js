import ffmpeg from 'fluent-ffmpeg';
import { PassThrough }  from 'stream';
import fs from 'fs';

import dotenv from "dotenv";
dotenv.config();

// Replace with your RTSP stream URL
const rtspUrl = process.env.RTSP_STREAM_URL;

// Create a PassThrough stream to handle the raw data
const passThroughStream = new PassThrough();

// Set up ffmpeg to read from RTSP and extract H264 stream
const ffmpegProcess = ffmpeg(rtspUrl)
    .noAudio() // Do not include audio
    //.videoCodec('libx264') // Use H264 codec
    .videoCodec('copy')
    .format('h264') // Output in H264 format
    .on('start', cmd => console.log('FFmpeg started:', cmd))
    .on('end', () => console.log('FFmpeg process ended'))
    .on('error', err => console.error('FFmpeg error:', err.message))
    .pipe(passThroughStream, { end: true });

const fileStream = fs.createWriteStream('output.h264');

// Consume the raw output programmatically
passThroughStream.on('data', chunk => {
    console.log('Received chunk:', chunk);
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
    console.log('ffmpegProcess', ffmpegProcess);
    passThroughStream.end();
}, 10000);
