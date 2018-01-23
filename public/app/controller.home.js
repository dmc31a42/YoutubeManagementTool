var controller = angular.module('angular-google-api-example.controller.home', []);

controller.controller('angular-google-api-example.controller.home', ['$scope', 'GApi', 'GAuth',
    function homeCtl($scope, GApi, GAuth) {

        GAuth.checkAuth().then(function(){
            GApi.load('youtube', 'v3').then(function() {
                GApi.executeAuth('youtube', 'channels.list',{
                    part: 'snippet',
                    mine: true
                }).then(function(channelsResp) {
                    function loadPlaylistsListRepeat(_playlistsResp){
                        if($scope.playlists == undefined){
                            $scope.playlists = [];
                        }
                        GApi.executeAuth('youtube','playlists.list',{
                            part: "snippet",
                            channelId: channelsResp.items[0].id,
                            maxResults: 50,
                            pageToken: _playlistsResp?_playlistsResp.nextPageToken:null
                        }).then(function(playlistsResp){
                            $scope.playlists = $scope.playlists.concat(playlistsResp.items);
                            console.log($scope.playlists);
                            if(playlistsResp.nextPageToken){
                                loadPlaylistsListRepeat(playlistsResp);
                            }
                        });     
                    }
                    loadPlaylistsListRepeat();      
                });
            });
        });

        $scope.viewDetail = function(playlist){
            $scope.playlistItems = [];
            GApi.load('youtube','v3').then(function() {
                function loadPlaylistItemsListRepeat(_playlistItemsResp){
                    if($scope.playlistItems == undefined){
                        $scope.playlistItems = [];
                    }
                    GApi.executeAuth('youtube', 'playlistItems.list', {
                        part: 'snippet',
                        playlistId: playlist.id,
                        maxResults: 50,
                        pageToken: _playlistItemsResp?_playlistItemsResp.nextPageToken:null
                    }).then(function(playlistItemsResp){
                        $scope.playlistItems = $scope.playlistItems.concat(playlistItemsResp.items);
                        console.log($scope.playlistItems);
                        if(playlistItemsResp.nextPageToken){
                            loadPlaylistItemsListRepeat(playlistItemsResp);
                        }
                    });  
                }
                loadPlaylistItemsListRepeat();
            });
        };
    }
]);