import chokidar from 'chokidar';
import fs from 'fs';
import {EVENTS, EVENT_TYPES} from "./Constants.js";

export default class FileSystemEventSource {

    constructor(camera, eventSource, eventBus) {
        this.camera = camera;
        this.eventSource = eventSource;
        this.eventBus = eventBus;

        if (eventSource.enabled) {
            this.initialize();
        }
    }

    initialize() {
        console.log("Start listening for filesystem events in", this.eventSource.folderPath);

        // check if file path in this.eventSource.folderPath exists
        if ( !fs.existsSync(this.eventSource.folderPath) ) {
            console.log("WARNING!!! Folder does not exist: ", this.eventSource.folderPath);
            return;
        }

        const watcher = chokidar.watch(this.eventSource.folderPath, { persistent: true, ignoreInitial:true });
        watcher.on('add', this.fileChanged.bind(this));
    }

    fileChanged(path) {
        //console.log("File changed: ", path, this.eventSource);

        const eventMessage = {
            type: EVENT_TYPES.FILESYSTEM,
            path: path,
            camera: this.camera,
            eventSource: this.eventSource
        }

        this.eventBus.emit(EVENTS.SOURCE_CHANGE, eventMessage);
    }

}