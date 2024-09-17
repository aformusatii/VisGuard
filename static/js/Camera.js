class Camera {

    constructor(cameras, $scope) {
        this.cameras = cameras;
        this.$scope = $scope;

        const $this = this;

        Object.defineProperty(this, 'localSettings', {
            get () {
                const key = `camera:${$this.label}`;

                const localSettings = localStorage.getItem(key);
                if (localSettings) {
                    return JSON.parse(localSettings);
                }

                return {
                    playbackRate: "1",
                    playerHeight: 500
                };
            },
            set(value) {
                console.log('Change in localSettings: ', value)
                const key = `camera:${$this.label}`;

                if (value) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            }
        });
    }

    initialize() {
        console.log('Camera->initialize()');

        let loaded = false;

        const hash = window.location.hash;
        if (hash) {
            const parts = hash.split(':');
            if (parts.length === 4) {
                this.label = parts[0].replaceAll(/!|#/gi, '');
                this.startDate = new Date(Number(parts[1]));
                this.endDate = new Date(Number(parts[2]));

                const selectedRecordIdStr = parts[3];
                this.selectedRecordId = (selectedRecordIdStr === 'none') ? null : Number(selectedRecordIdStr);

                loaded = true;
            }
        }

        if (!loaded) {
            this.updateStartAndEndDate(new Date());
            this.label = this.cameras[0].label;
        }

        this.recordsDate = this.startDate;

        this.select(this.label);
    }

    updateStartAndEndDate(date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        this.startDate = startDate;
        this.endDate = endDate;

        //console.log('updateStartAndEndDate', date, this.startDate, this.endDate);
    }

    select(cameraLabel) {
        const $this = this;

        const camera = this._getCameraByLabel(cameraLabel);
        for (const prop in camera) {
            if (Object.prototype.hasOwnProperty.call(camera, prop)) {
                $this[prop] = camera[prop];
            }
        }

        console.log('camera->', camera);
    }

    _getCameraByLabel(cameraLabel) {
        return this.cameras.find(camera => camera.label === cameraLabel);
    }

    updatePageUrl() {
        const cameraLabel = this.label;
        const startTime = this.startDate.getTime();
        const endTime = this.endDate.getTime();
        const selectedRecordId = this.selectedRecordId || 'none';
        const hash = `${cameraLabel}:${startTime}:${endTime}:${selectedRecordId}`;

        //console.log('updatePageUrl', hash);
        window.location.hash = hash;
    }

    /********************************************************************************************************************
     * Loaders
     *******************************************************************************************************************/
    async loadFirstRecordDateTime() {
        let firstRecordDateTime = null;

        try {
            firstRecordDateTime = await DataLoaderInstance.getFirstVideoRecordDateTime(this.label);
        } catch (error) {
            firstRecordDateTime = new Date();
            console.error('Failed to get first record date time', firstRecordDateTime);
        }

        this.firstRecordDate = new Date(firstRecordDateTime).toISOString().split("T")[0];

        const $this = this;
        this.$scope.$apply(() => {
            $this.firstRecordDate = $this.firstRecordDate;
        });
    }

    async loadRecords() {
        this.records = await DataLoaderInstance.getRecords(this.label, this.startDate.getTime(), this.endDate.getTime());
        //console.log('this.records: ', this.startDate, this.endDate, this.records);

        this.records.forEach(record => {
            const recordDate = new Date(record.start_time);
            const hour = String(recordDate.getHours()).padStart(2, '0');
            const minute = String(recordDate.getMinutes()).padStart(2, '0');
            const second = String(recordDate.getSeconds()).padStart(2, '0');
            record.starTimeStr = `${hour}:${minute}:${second}`;
        });

        const $this = this;
        this.$scope.$apply(() => {
            $this.records = $this.records;
        });
    }
}