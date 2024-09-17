import videoRecordRepo from "./VideoRecordRepository.js";
import bytes from "bytes";
import Fs from 'fs/promises'
import Logger from "./Logger.js";

export default class VideoFolderManager {

    constructor(camera) {
        this.camera = camera;
        this.totalSize = 0;
        this.logger = new Logger('VideoFolderManager', camera);
    }

    async initialize() {
        await this.loadTotalFolderSize();
        const interval = 1000 * 60 * 60; // once per hour
        setInterval(this.cleanUpOldFiles.bind(this), interval);
    }

    async loadTotalFolderSize() {
        const result = await videoRecordRepo.getTotalSize(this.camera.label);
        if (result.length > 0) {
            this.totalSize = result[0].total_size;
            this.logger.log('Total folder size:', this.totalSize);
            this.camera.totalSize = this.totalSize;
        }
    }

    increaseTotalFolderSize(size) {
        // !!! Increase total size of folder
        this.totalSize = this.totalSize + size;
        this.camera.totalSize = this.totalSize;
    }

    decreaseTotalFolderSize(size) {
        // !!! Decrease total size of folder
        this.totalSize = this.totalSize - size;
        this.camera.totalSize = this.totalSize;
    }

    async cleanUpOldFiles() {
        const videoRecorder = this.camera.videoRecorder;
        const maxFolderSize = bytes.parse(videoRecorder.maxFolderSize);

        if (videoRecorder.enabled == false || typeof maxFolderSize === 'undefined' || maxFolderSize == 0) {
            return;
        }

        const msg = `Checking folder size, total size: ${this.totalSize}, max size: ${maxFolderSize}`;
        this.logger.log(msg);

        if (this.totalSize > maxFolderSize) {
            const oldestRecords = await videoRecordRepo.getOldestRecords(this.camera.label);

            for (const record of oldestRecords) {

                if (this.totalSize <= maxFolderSize) {
                    break;
                }

                const filePath = record.file_path;
                const fileSize = record.size;

                try {
                    const msg = `Deleting file: "${filePath}", with size "${fileSize}", total size: "${this.totalSize}", max size: "${maxFolderSize}"`;
                    this.logger.log(msg);

                    // Delete record file
                    await Fs.unlink(filePath);

                    // Delete record from database
                    await videoRecordRepo.deleteVideoRecord(record.id);

                    this.decreaseTotalFolderSize(fileSize);

                } catch (err) {
                    this.logger.error('Error deleting file:', filePath, err);
                }
            }
        }
    }

}