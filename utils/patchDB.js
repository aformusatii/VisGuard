import SQLite3 from "../src/SQLite3.js";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const databaseFilePath = path.resolve(__dirname, '..', 'database.db');
const db = new SQLite3(databaseFilePath);

const addSizeColumn = async function() {
    await db.open();
    await db.run('ALTER TABLE video_records ADD COLUMN size INTEGER;');
    await db.run('UPDATE video_records SET size = 0;');
    // select all records
    const records = await db.all('SELECT * FROM video_records;');
    console.log('Records 1', records[0]);
}

addSizeColumn();
