import fs from 'fs';
import yaml from 'js-yaml';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

class Configuration {

    constructor(filePath) {
        this.filePath = filePath;
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        try {
            const file = fs.readFileSync(this.filePath, 'utf8');
            this.config = yaml.load(file);
        } catch (e) {
            console.error('Error loading configuration:', e);
        }
    }

    _prepareConfig() {
        // Create a map of cameras for easy lookup by label
        this.config.camerasMap = {};
        this.config.cameras.forEach((camera) => {
            this.config.camerasMap[camera.label] = camera;
        });
    }

    getConfig() {
        this._prepareConfig();
        return this.config;
    }

}

const configPath = path.resolve(__dirname, '..', 'configuration.yaml');
const configInstance = new Configuration(configPath).getConfig();

export default configInstance;