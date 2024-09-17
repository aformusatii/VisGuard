THEAPP.component('cameraSettingsModal', {
    templateUrl: 'js/components/camera-settings-modal/camera-settings-modal.html',
    bindings: {
        controller: '&'
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            const $modal = $element.find('.modal');
            const modal = new bootstrap.Modal($modal);

            if ($this.controller) {
                const ctrl = $this.controller();

                ctrl.open = function(camera, confirmCallback) {
                    $scope.camera = camera;
                    $scope.confirmCallback = confirmCallback;
                    modal.show();
                };

                $scope.confirmAction = function() {
                    $scope.confirmCallback($scope.camera);
                    modal.hide();
                }
            }
        }
    }
});