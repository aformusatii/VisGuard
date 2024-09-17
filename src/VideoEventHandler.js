import {EVENTS} from "./Constants.js";
import VideoRecorder from "./VideoRecorder.js";
import videoRecordRepo from "./VideoRecordRepository.js";
import Fs from 'fs/promises'


export default class VideoEventHandler {

    constructor(camera, eventBus, videoFolderManager) {
        this.camera = camera;
        this.eventBus = eventBus;
        this.videoFolderManager = videoFolderManager;
        this.viderRecordMeta = null;

        eventBus.on(EVENTS.VIDEO_EVENT_START, this.onEventStart.bind(this));
        eventBus.on(EVENTS.VIDEO_EVENT_END, this.onEventStop.bind(this));
    }

    async onEventStart(eventContext) {
        this.videoRecorder = new VideoRecorder(this.camera);
        const outputFilePath = this.videoRecorder.startRecording();

        const record = {
            camera: this.camera.label,
            start: new Date().getTime(),
            filePath: outputFilePath
        }
        this.viderRecordMeta = await videoRecordRepo.createNewVideoRecord(record);
        this.viderRecordMeta.record = record;
    }

    async onEventStop(eventContext) {
        await this.videoRecorder.stopRecording();

        const recordId = this.viderRecordMeta.lastID;
        const fileStat = await Fs.stat(this.viderRecordMeta.record.filePath);

        await videoRecordRepo.updateVideoRecordEndTime(recordId, new Date().getTime(), fileStat.size);
        this.videoFolderManager.increaseTotalFolderSize(fileStat.size);
    }

}