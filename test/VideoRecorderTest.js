import config from "../src/Configuration.js";
import VideoRecorder from "../src/VideoRecorder.js";

const test = function() {
    const videoRecorder = new VideoRecorder(config.cameras[0]);

    videoRecorder.startRecording();

    setTimeout(() => {
        videoRecorder.stopRecording();
    }, 5000);
}

test();