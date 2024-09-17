THEAPP.component('cameraInfoModal', {
    templateUrl: 'js/components/camera-info-modal/camera-info-modal.html',
    bindings: {
        controller: '&',
        camera: '<'
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            const $modal = $element.find('.modal');
            const modal = new bootstrap.Modal($modal);

            if ($this.controller) {
                const ctrl = $this.controller();

                ctrl.open = function() {
                    modal.show();
                };
            }
        };

        this.$onChanges = function(changes) {
            if (changes.camera && changes.camera.currentValue) {
                //console.log('changes.playbackRate.currentValue->', changes.playbackRate.currentValue);
                $scope.camera = changes.camera.currentValue;
            }
        };
    }
});