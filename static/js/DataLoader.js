
class DataLoader {

    constructor($http) {
        this.$http = $http;
    }

    async getCameras() {
        return new Promise((resolve, reject) => {
            this.$http({
                method: 'GET',
                url: '/cameras'
            }).then(function successCallback(response) {
                resolve(response.data);

            }, function errorCallback(response) {
                reject(response);

            });
        });
    }

    async getRecords(camera, startTime, endTime) {
        return new Promise((resolve, reject) => {
            this.$http({
                method: 'GET',
                url: `/cameras/${camera}/records?startTime=${startTime}&endTime=${endTime}`
            }).then(function successCallback(response) {
                resolve(response.data);

            }, function errorCallback(response) {
                reject(response);

            });
        });
    }

    async getFirstVideoRecordDateTime(camera) {
        return new Promise((resolve, reject) => {
            this.$http({
                method: 'GET',
                url: `/cameras/${camera}/firstDateTime`
            }).then(function successCallback(response) {
                resolve(response.data);

            }, function errorCallback(response) {
                reject(response);

            });
        });
    }

}