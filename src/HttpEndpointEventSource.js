import {EVENT_TYPES, EVENTS} from "./Constants.js";


export default class HttpEndpointEventSource {

    constructor(camera, eventSource, eventBus, expressApp) {
        this.camera = camera;
        this.eventSource = eventSource;
        this.eventBus = eventBus;
        this.expressApp = expressApp;

        if (eventSource.enabled) {
            this.initialize();
        }
    }

    initialize() {
        const contextPath = this.eventSource.contextPath;
        console.log("Start listening for http endpoint events in", contextPath);
        this.expressApp.get(contextPath, this.httpEvent.bind(this));
        this.expressApp.post(contextPath, this.httpEvent.bind(this));
    }

    httpEvent(req, res) {
        console.log("Http event received: ", req.body);

        const eventMessage = {
            type: EVENT_TYPES.HTTP_ENDPOINT,
            camera: this.camera,
            eventSource: this.eventSource
        }

        this.eventBus.emit(EVENTS.SOURCE_CHANGE, eventMessage);

        res.json({ok: true});
    }
}