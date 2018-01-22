var app = angular.module('angular-google-api-example', [
    'ngCookies',
    'ui.router',
    'angular-google-gapi',

    'angular-google-api-example.router',
    'angular-google-api-example.controller'

]);

app.run(['GAuth', 'GApi', 'GData', '$state', '$rootScope', '$window', '$cookies',
    function(GAuth, GApi, GData, $state, $rootScope, $window, $cookies) {

        $rootScope.gdata = GData;

        var CLIENT = '615017914706-934pbfeon08pnimorh9vdl8fp3ttf4ir.apps.googleusercontent.com';
        var BASE;
        if($window.location.hostname == 'localhost') {
            BASE = '//localhost:8080/_ah/api';
        } else {
            BASE = 'https://cloud-endpoints-gae.appspot.com/_ah/api';
        }

        BASE = 'https://cloud-endpoints-gae.appspot.com/_ah/api';

        //GApi.load('myContactApi', 'v1', BASE);
        GApi.load('calendar', 'v3');
        GAuth.setClient(CLIENT);
        //GAuth.setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly');
        GAuth.setScope('https://www.googleapis.com/auth/youtube');

        var currentUser = $cookies.get('userId');
        if(currentUser) {
            GData.setUserId(currentUser);
            GAuth.checkAuth().then(
                function () {
                    if($state.includes('login'))
                        $state.go('home');
                },
                function() {
                    $state.go('login');
                }
            );
        } else {
            $state.go('login');
        }



        $rootScope.logout = function() {
            GAuth.logout().then(function () {
                $cookies.remove('userId');
                $state.go('login');
            });
        };
    }
]);
