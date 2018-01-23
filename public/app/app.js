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

        var CLIENT = CLIENT_SECRRETS_CLIENT_ID;
        var BASE;
        if($window.location.hostname == 'localhost') {
            BASE = '//localhost:8080/_ah/api';
        } else {
            BASE = 'https://cloud-endpoints-gae.appspot.com/_ah/api';
        }

        BASE = 'https://cloud-endpoints-gae.appspot.com/_ah/api';

        //GApi.load('myContactApi', 'v1', BASE);
        GApi.load('youtube', 'v3');
        GAuth.setClient(CLIENT);
        //GAuth.setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly');
        GAuth.setScope('https://www.googleapis.com/auth/youtube');

        GAuth.checkAuth().then(
            function () {
                if($state.includes('login'))
                    $state.go('home');
            },
            function() {
                $state.go('login');
            }
        );



        $rootScope.logout = function() {
            GAuth.logout().then(function () {
                $cookies.remove('userId');
                $state.go('login');
            });
        };
    }
]);
