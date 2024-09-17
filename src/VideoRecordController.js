import videoRecordRepo from "./VideoRecordRepository.js";

export default class VideoRecordController {

    async getVideoRecords(req, res) {
        const camera = req.params.camera;
        const startTime = req.query.startTime;
        const endTime = req.query.endTime;

        const records = await videoRecordRepo.getVideoRecords(camera, startTime, endTime);
        res.json(records);
    }

    async getFirstVideoRecordDateTime(req, res) {
        const camera = req.params.camera;

        const result = await videoRecordRepo.getFirstVideoRecordDateTime(camera);

        if (result.length === 0) {
            res.status(404);
            res.end();
            return;
        }

        res.json(result[0].start_time);
    }

}