/* *****************************************************************************
*  Init Angular App
* *****************************************************************************/
let DataLoaderInstance = null;

window.THEAPP = (function(angular) {
    'use strict';
    console.log('Init Angular Js App');

    const app = angular.module('ngVisGuard', []);

    // Run block to execute code at app initialization
    app.run(['$http', function($http) {
        DataLoaderInstance = new DataLoader($http);
    }]);

    // Define the custom filter
    app.filter('byteToMb', function() {
        return function(input) {
            if (isNaN(input)) {
                return input;
            }
            const mbValue = (input / (1024 * 1024)).toFixed(2); // Convert bytes to MB
            return mbValue;
        };
    });

    // Define the custom filter
    app.filter('msToSec', function() {
        return function(input) {
            if (isNaN(input)) {
                return input;
            }
            const mbValue = (input / (1024)).toFixed(2); // Convert bytes to MB
            return mbValue;
        };
    });

    app.controller('DefaultController', DefaultController);

    return app;

})(window.angular);
