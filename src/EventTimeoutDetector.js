import {EVENTS, EVENT_TYPES} from "./Constants.js";
import ms from 'ms';

export default class EventTimeoutDetector {

    constructor(camera, eventBus) {
        this.camera = camera;
        this.eventBus = eventBus;
        this.lastEvent = null;

        this.eventTimeout = ms(camera.eventHandler.timeout);

        eventBus.on(EVENTS.SOURCE_CHANGE, this.onMessage.bind(this));
        setInterval(this.eventTimeoutLoop.bind(this), 2000);
    }

    onMessage(message) {
        if (this.lastEvent === null) {
            // create new event
            this.lastEvent = {
                messages: [],
            };

            const eventContext = {
                camera: this.camera,
                lastEvent: this.lastEvent
            };

            this.eventBus.emit(EVENTS.VIDEO_EVENT_START, eventContext);
        }

        this.lastEvent.lastUpdateAt = new Date();
        this.lastEvent.messages.push(message);
    }

    eventTimeoutLoop() {
        if (this.lastEvent === null) {
            return;
        }

        const now = new Date();
        const diff = now.getTime() - this.lastEvent.lastUpdateAt.getTime();
        if (diff > this.eventTimeout) {
            const eventContext = {
                camera: this.camera,
                lastEvent: this.lastEvent
            };

            this.eventBus.emit(EVENTS.VIDEO_EVENT_END, eventContext);
            this.lastEvent = null;
        }
    }

}