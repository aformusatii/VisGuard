/* *****************************************************************************
*  Default Controller
* *****************************************************************************/
const DefaultController = function($rootScope, $scope, $location) {
    console.log('DefaultController');

    $scope.todayDate = new Date().toISOString().split("T")[0];

    $scope.videoPlayer = {};
    $scope.videoPlayer.onInit = function() {
        console.log('videoPlayer->onInit');
    }

    $scope.cameraSettingsModal = {};
    $scope.cameraInfoModal = {};

    /* ============================================================ */
    /*                    UI Event Handlers                         */
    /* ============================================================ */
    $scope.selectCamera = function(cameraLabel) {
        $scope.selectedCamera.selectedRecordId = null;
        $scope.selectedCamera.select(cameraLabel);

        loadRecordsAndPlay($scope);
    }

    $scope.updateRecordsDate = function() {
        if (typeof $scope.selectedCamera.recordsDate === 'undefined') {
            return;
        }

        loadRecordsForSelectedDate($scope);
    }

    $scope.playRecord = function(record) {
        $scope.selectedCamera.selectedRecordId = record.id;
        playRecord($scope, record);
    }

    $scope.playOnline = function() {
        $scope.selectedCamera.selectedRecordId = null;
        playOnline($scope);
    }

    const confirmCameraSettings = function(newSettings) {
        console.log('Apply Camera Settings');
        $scope.selectedCamera.localSettings = newSettings;
    }

    $scope.showCameraSettings = function() {
        const localSettings = Object.assign({}, $scope.selectedCamera.localSettings);
        $scope.cameraSettingsModal.open(localSettings, confirmCameraSettings);
    }

    $scope.copyUrl = function() {
        const url = window.location.href;
        copyToClipboard(url);
    }

    /* ============================================================ */
    /*                    Initialize Page !!!                       */
    /* ============================================================ */
    initilizePage($scope);
}

const initilizePage = async function($scope) {
    const cameras = await DataLoaderInstance.getCameras();

    $scope.$apply(() => {
        $scope.cameras = cameras;

        $scope.selectedCamera = new Camera(cameras, $scope);
        $scope.selectedCamera.initialize();

        loadRecordsAndPlay($scope);
    });
}

const loadRecordsAndPlay = async function($scope) {
    await $scope.selectedCamera.loadRecords();
    await $scope.selectedCamera.loadFirstRecordDateTime();

    if ($scope.selectedCamera.selectedRecordId === null) {
        await playOnline($scope);
    } else {
        $scope.selectedCamera.records.forEach(record => {
            if (record.id === $scope.selectedCamera.selectedRecordId) {
                playRecord($scope, record);
            }
        });
    }

    $scope.selectedCamera.updatePageUrl();
}

const loadRecordsForSelectedDate = async function($scope) {
    console.log('$scope.selectedCamera.recordsDate', $scope.selectedCamera.recordsDate);
    $scope.selectedCamera.updateStartAndEndDate($scope.selectedCamera.recordsDate);
    $scope.selectedCamera.updatePageUrl();
    await $scope.selectedCamera.loadRecords();
}

const playRecord = async function($scope, record) {
    console.log('playRecord', record);

    const fileName = extractFileName(record.file_path);
    const videoSrc = `/camera/${$scope.selectedCamera.label}/videos/${fileName}`;

    $scope.videoPlayer.playRecording(videoSrc);

    $scope.selectedCamera.updatePageUrl();
}

const playOnline = async function($scope) {
    const streamPath = `${$scope.selectedCamera.label}/mainStream`;
    $scope.videoPlayer.playStream(streamPath);
    $scope.selectedCamera.updatePageUrl();
}

function extractFileName(filePath) {
    // Normalize the path separator to forward slash
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Split the normalized path string by the forward slash separator
    const parts = normalizedPath.split('/');

    // Get the last element of the array, which is the file name
    return parts[parts.length - 1];
}
