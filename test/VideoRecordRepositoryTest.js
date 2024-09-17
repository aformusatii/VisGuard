import videoRecordRepo from "../src/VideoRecordRepository.js";

const test = async function() {

    await new Promise(r => setTimeout(r, 2000));

    const result = await videoRecordRepo.createNewVideoRecord({
        camera: 'test',
        start: new Date().getTime(),
        end: null,
        filePath: 'test'
    });

    console.log('result', result);

    await videoRecordRepo.updateVideoRecordEndTime(result.lastID, new Date().getTime());

    const list = await videoRecordRepo.getVideoRecords('test', new Date().getTime() - 10000, new Date().getTime());

    console.log('list', list);
}

const test2 = async function() {
    await new Promise(r => setTimeout(r, 2000));

    const list = await videoRecordRepo.getVideoRecords('back_garden', new Date().getTime() - 1000000, new Date().getTime());
    console.log('list', list);
}

test2();