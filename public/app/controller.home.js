var controller = angular.module('angular-google-api-example.controller.home', ['ui.sortable','ui.sortable.multiselection']);

controller.controller('angular-google-api-example.controller.home', ['$scope', 'GApi', 'GAuth', 'uiSortableMultiSelectionMethods',
    function homeCtl($scope, GApi, GAuth, uiSortableMultiSelectionMethods) {

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

        $scope.sortableOptions = uiSortableMultiSelectionMethods.extendOptions({
        //'multiSelectOnClick': true,
            stop: function(e, ui) {
              // this callback has the changed model
              var logEntry = $scope.playlistItems.map(function(i) {
                  return i.id;
              }).join('\n');
              console.log(logEntry);
            }
          });

        angular.element('[ui-sortable]').on('ui-sortable-selectionschanged', function(e, args){
            var $this = $(this);
            var selectedItemIndexes = $this.find('.ui-sortable-selected').map(function(i, element){
                return $(this).index();
            }).toArray();
            console.log(selectedItemIndexes);
            var selectedItems = $.map(selectedItemIndexes, function(i) {
                return $scope.playlistItems[i]
            });
            console.log(selectedItems);
            $scope.selectedItem = selectedItems;
        });
    }
]);