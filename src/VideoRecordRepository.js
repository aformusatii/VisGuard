import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

import SQLite3 from "./SQLite3.js";

const VIDEO_RECORDS_TABLE = `
    CREATE TABLE IF NOT EXISTS video_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camera INTEGER,
        start_time INTEGER,
        end_time INTEGER,
        duration INTEGER,
        file_path TEXT,
        size INTEGER
    );
`.trim();

const VIDEO_RECORDS_INSERT = 'INSERT INTO video_records (camera, start_time, file_path) VALUES (?, ?, ?);';
const VIDEO_RECORDS_UPDATE = 'UPDATE video_records SET end_time = ?, duration = (? - start_time), size = ? WHERE id = ?;';
const VIDEO_RECORDS_GET_ALL = 'SELECT * FROM video_records WHERE camera = ? AND start_time >= ? AND end_time <= ?;';
const VIDEO_RECORDS_GET_FIRST_DATETIME = 'SELECT start_time FROM video_records WHERE camera = ? ORDER BY start_time ASC LIMIT 1';
const VIDEO_RECORDS_GET_TOTAL_SIZE = 'SELECT SUM(size) AS total_size FROM video_records WHERE camera = ?';
const VIDEO_RECORDS_GET_OLDEST_RECORDS = 'SELECT * FROM video_records WHERE camera = ? ORDER BY start_time ASC LIMIT 20';
const VIDEO_RECORDS_DELETE = 'DELETE FROM video_records WHERE id = ?;';

class VideoRecordRepository {

    constructor() {
        this.videoRecords = [];
    }

    async initializeDB() {
        const databaseFilePath = path.resolve(__dirname, '..', 'database.db');
        this.db = new SQLite3(databaseFilePath);
        await this.db.open();
        await this.db.run(VIDEO_RECORDS_TABLE);
    }

    async createNewVideoRecord(videoRecord) {
        return await this.db.run(
            VIDEO_RECORDS_INSERT, [
                videoRecord.camera,
                videoRecord.start,
                videoRecord.filePath
            ]
        );
    }

    async updateVideoRecordEndTime(id, endTime, fileSize) {
        return await this.db.run(
            VIDEO_RECORDS_UPDATE, [endTime, endTime, fileSize, id]
        );
    }

    async getVideoRecords(camera, start, end) {
        return await this.db.all(
            VIDEO_RECORDS_GET_ALL,
            [camera, start, end]
        );
    }

    async getFirstVideoRecordDateTime(camera) {
        return await this.db.all(
            VIDEO_RECORDS_GET_FIRST_DATETIME,
            [camera]
        );
    }

    async getTotalSize(camera) {
        return await this.db.all(
            VIDEO_RECORDS_GET_TOTAL_SIZE,
            [camera]
        );
    }

    async getOldestRecords(camera) {
        return await this.db.all(
            VIDEO_RECORDS_GET_OLDEST_RECORDS,
            [camera]
        );
    }

    async deleteVideoRecord(id) {
        return await this.db.run(
            VIDEO_RECORDS_DELETE,
            [id]
        );
    }
}

const videoRecordRepoInstance = new VideoRecordRepository();

(async function() {
    console.log('Initialize Video Record Repository DB - start');
    await videoRecordRepoInstance.initializeDB();
    console.log('Initialize Video Record Repository DB - completed');
})();

export default videoRecordRepoInstance;