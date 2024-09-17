import config from "./Configuration.js";
import FileSystemEventSource from "./FileSystemEventSource.js";
import EventTimeoutDetector from "./EventTimeoutDetector.js";
import EventBus from "./EventBus.js";
import VideoEventHandler from "./VideoEventHandler.js";
import HttpServer from "../src/HttpServer.js";
import HttpEndpointEventSource from "./HttpEndpointEventSource.js";
import VideoFolderManager from "./VideoFolderManager.js";

class Launcher {

    start() {
        console.log("Starting launcher");
        config.cameras.forEach(this.initializeCamera.bind(this));
    }

    initializeCamera(camera) {
        console.log("Initializing camera: ", camera.name);

        const $this = this;
        const eventBus = new EventBus();

        camera.eventSources.forEach((eventSource) => {
            $this.initializeEventSource(camera, eventSource, eventBus);
        });

        const videoFolderManager = new VideoFolderManager(camera);
        videoFolderManager.initialize();

        new EventTimeoutDetector(camera, eventBus);
        new VideoEventHandler(camera, eventBus, videoFolderManager);
    }

    initializeEventSource(camera, eventSource, eventBus) {
        console.log("Initializing event source: ", eventSource.type, " for camera: ", camera.name);

        switch (eventSource.type) {
            case "FileSystem":
                new FileSystemEventSource(camera, eventSource, eventBus);
                break;
            case "HttpEndpoint":
                new HttpEndpointEventSource(camera, eventSource, eventBus, HttpServer.getExpressApp());
                break;
            default:
                console.log("Unknown event source type: ", eventSource.type, " skipping");
        }
    }

}

const launcherInstance = new Launcher();
export default launcherInstance;