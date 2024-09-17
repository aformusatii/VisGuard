import Fs from "fs/promises";

const filePath = 'C:\\temp\\videos_back_garden\\video-2024_08_20_08-01-16-619.mp4';

const fileStat = await Fs.stat(filePath);

console.log('fileStat.size', fileStat.size);