
export default class Logger {

    constructor(service, camera) {
        this.service = service;
        this.camera = camera;
    }

    log(...args) {
        console.log(`[${this.service}] - [${this.camera.label}]`, ...args);
    }

    error(...args) {
        console.error(`[${this.service}] - [${this.camera.label}]`, ...args);
    }

}