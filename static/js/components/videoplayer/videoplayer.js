THEAPP.component('videoPlayer', {
    templateUrl: 'js/components/videoplayer/videoplayer.html',
    bindings: {
        controller: '<',
        playbackRate: '<',
        height: '<'
    },
    controller: function($element, $scope) {
        let videoPlayerController;

        this.$onInit = function() {
            videoPlayerController = new VideoPlayerController($element);

            this.controller.playRecording = videoPlayerController.playRecording.bind(videoPlayerController);
            this.controller.playStream = videoPlayerController.playStream.bind(videoPlayerController);
            this.controller.onInit();
        }

        this.$onChanges = function(changes) {
            if (typeof videoPlayerController === 'undefined') {
                return;
            }

            if (changes.playbackRate && changes.playbackRate.currentValue) {
                //console.log('changes.playbackRate.currentValue->', changes.playbackRate.currentValue);
                videoPlayerController.setPlaybackRate(changes.playbackRate.currentValue);
            }

            if (changes.height && changes.height.currentValue) {
                //console.log('changes.height.currentValue->', changes.height.currentValue);
                videoPlayerController.setHeight(changes.height.currentValue);
            }
        };
    }
});

const VIDEO_TYPE_STREAM = 'stream';
const VIDEO_TYPE_RECORDING = 'recording';

class VideoPlayerController {

    constructor($element) {
        this.$videoPlayerRecording = $element.find('video.recording');
        this.$videoPlayerStreaming = $element.find('video.streaming');

        this.$videoPlayerRecordingSource = this.$videoPlayerRecording.find('source');

        this.videoPlayerRecording = this.$videoPlayerRecording.get(0);
        this.videoPlayerStreaming = this.$videoPlayerStreaming.get(0);

        this.playbackRate = 1.0;

        this.streamPath = null;
        this.recordingPath = null;
        this.type = null;

        this.jmuxer = new JMuxer({
            node: this.$videoPlayerStreaming.get(0),
            mode: 'video',
            flushingTime: 100,
            debug: false,
            onError: function(data) {
                console.log('JMuxer Error:', data);

                if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
                    $this.jmuxer.reset();
                }
            }
        });

        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
    }

    prepare(type) {
        this.stop();

        switch (type) {
            case VIDEO_TYPE_RECORDING:
                this.$videoPlayerRecording.show();
                this.$videoPlayerStreaming.hide();

                break;

            case VIDEO_TYPE_STREAM:
                this.$videoPlayerRecording.hide();
                this.$videoPlayerStreaming.show();

                break;
        }
    }

    playStream(streamPath) {
        this.streamPath = streamPath;

        console.log('Play Stream:', streamPath);

        this.prepare(VIDEO_TYPE_STREAM);

        const $this = this;

        const videoDataHandler = function(chunk) {
            $this.jmuxer.feed({
                video: new Uint8Array(chunk)
            });
        }

        this.ws = new VideoWebSocket(streamPath, videoDataHandler);

        this.play(VIDEO_TYPE_STREAM);
    }

    playRecording(recordingPath) {
        this.recordingPath = recordingPath;

        console.log('Play Recording:', recordingPath);

        this.prepare(VIDEO_TYPE_RECORDING);

        this.$videoPlayerRecordingSource.attr('src', recordingPath);
        this.$videoPlayerRecordingSource.attr('type', 'video/mp4');

        this.videoPlayerRecording.load();
        this.videoPlayerRecording.playbackRate = parseInt(this.playbackRate);

        this.play(VIDEO_TYPE_RECORDING);
    }

    stop() {
        this.videoPlayerRecording.pause();
        this.videoPlayerStreaming.pause();

        if (this.ws) {
            // close previous websocket
            this.ws.close();
        }
    }

    async play(type) {
        this.type = type;

        try {
            switch (type) {
                case VIDEO_TYPE_RECORDING:
                    await this.videoPlayerRecording.play();
                    break;

                case VIDEO_TYPE_STREAM:
                    await this.videoPlayerStreaming.play();
                    break;
            }

        } catch (e) {
            console.log('Play Error:', e);
        }
    }

    setPlaybackRate(playbackRate) {
        if (playbackRate) {
            this.playbackRate = playbackRate;
            this.videoPlayerRecording.playbackRate = parseInt(playbackRate);
        }
    }

    setHeight(height) {
        this.$videoPlayerRecording.height(height);
        this.$videoPlayerStreaming.height(height);
    }

    onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log('Visibility Change: Visible');
            this.resume();
        } else {
            console.log('Visibility Change: Invisible');
            this.stop();
        }
    }

    async resume() {
        try {
            switch (this.type) {
                case VIDEO_TYPE_RECORDING:
                    await this.playRecording(this.recordingPath);
                    break;

                case VIDEO_TYPE_STREAM:
                    await this.playStream(this.streamPath);
                    break;
            }

        } catch (e) {
            console.log('Resume Error:', e);
        }
    }

}

class VideoWebSocket {

    constructor(wsPath, videoDataHandler) {
        this.videoDataHandler = videoDataHandler;

        const loc = window.location;
        const wsProtocol = loc.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${wsProtocol}://${loc.host}/ws/cameras/${wsPath}`;

        console.log('WebSocket URL:', wsUrl);

        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    }

    onOpen() {
        console.log('WebSocket connection established');
    }

    onMessage(event) {
        //console.log('event.data', event.data);
        this.videoDataHandler(event.data);
    }

    onClose() {
        console.log('WebSocket connection closed');
    }

    close() {
        this.ws.send('close');
    }

}