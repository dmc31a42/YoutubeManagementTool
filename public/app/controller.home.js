var controller = angular.module('angular-google-api-example.controller.home', ['ui.sortable','ui.sortable.multiselection']);

controller.controller('angular-google-api-example.controller.home', ['$scope', 'GApi', 'GAuth', 'uiSortableMultiSelectionMethods', '$sce',
    function homeCtl($scope, GApi, GAuth, uiSortableMultiSelectionMethods, $sce) {

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
            $scope.playlistItemVideos = [];
            GApi.load('youtube','v3').then(function() {
                function loadPlaylistItemsListRepeat(_playlistItemsResp){
                    if($scope.playlistItems == undefined){
                        $scope.playlistItems = [];
                    }
                    if($scope.playlistItemVideos == undefined) {
                        $scope.playlistItemVideos = [];
                    }
                    GApi.executeAuth('youtube', 'playlistItems.list', {
                        part: 'snippet',
                        playlistId: playlist.id,
                        maxResults: 50,
                        pageToken: _playlistItemsResp?_playlistItemsResp.nextPageToken:null
                    }).then(function(playlistItemsResp){
                        $scope.playlistItems = $scope.playlistItems.concat(playlistItemsResp.items);
                        var playlistItemsVideoids = playlistItemsResp.items.map(item=> item.snippet.resourceId.videoId);
                        loadVideosListRepeat(playlistItemsVideoids);
                        console.log($scope.playlistItems);
                        if(playlistItemsResp.nextPageToken){
                            loadPlaylistItemsListRepeat(playlistItemsResp);
                        }
                    });  
                }
                function loadVideosListRepeat(_playlistItemsVideoids){
                    GApi.executeAuth('youtube', 'videos.list', {
                        part: 'snippet',
                        id: _playlistItemsVideoids.join(',')
                    }).then(function(videosResp){
                        $scope.playlistItemVideos = $scope.playlistItemVideos.concat(videosResp.items);
                        _playlistItemsVideoids.splice(0,videosResp.pageInfo.resultsPerPage || videosResp.pageInfo.totalResults);
                        if(_playlistItemsVideoids.length != 0){
                            loadVideosListRepeat(_playlistItemsVideoids);
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

        $scope.selectedItemInput = {};
        $scope.selectedItems = [];

        $scope.IsInputChanged = function(){
            if($scope.selectedItems.length!=1) {
                    return false;
            }
            var ref = $scope.selectedItems[0].snippet;
            var mod = $scope.selectedItemInput;
            if(ref.title != mod.title | 
            ref.description != mod.description | 
            ref.tags != mod.tags |
            ref.categoryId | mod.categoryId)
            {
                    return true;
            }else{
                    return false;
            }
        };

        angular.element('[ui-sortable]').on('ui-sortable-selectionschanged', function(e, args){
            var $this = $(this);
            var selectedItemIndexes = $this.find('.ui-sortable-selected').map(function(i, element){
                return $(this).index();
            }).toArray();
            console.log(selectedItemIndexes);
            var selectedItems = [];
            selectedItems = $.map(selectedItemIndexes, function(i) {
                return $scope.playlistItems[i]
            });
            console.log(selectedItems);
            $scope.selectedItems = selectedItems;
            if($scope.selectedItems.length == 1){
                $scope.selectedItemVideoURL = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.selectedItems[0].snippet.resourceId.videoId);
                $scope.selectedItemInput =  selectedItems[0].snippet; 
            }

            var selectedItemUniqueKinds = $scope.selectedItems.map(function(element){
                return element.kind;
            }).filter(function(value, index, self){
                return self.indexOf(value) === index;
            });
            $scope.selectedItemUniqueKinds = selectedItemUniqueKinds;
           
           if($scope.selectedItems.length>=2){
               var titles = $scope.selectedItems.map(function(item){
                   return item.snippet.title;
               });
               determinateSimulality(titles); 
               function determinateSimulality(array){
                   var presetChangedArray = angular.copy(array);
                   //var presetChangedArray = array.map(function(item) {

                   //});
                   var refString = presetChangedArray[0];
                   var dic = [];
                   var pos = 0;
                   var length = 2;
                   while(pos+length <= refString.length){
                       var tempString = refString.substring(pos,pos+length);
                       var tempArray = presetChangedArray.filter(item=>item.includes(tempString));
                       if(tempArray.length == presetChangedArray.length){
                           var preDicIndex = dic.indexOf(tempString.substring(0,tempString.length-1));
                           if(preDicIndex>-1){
                               dic.splice(preDicIndex, 1);
                           }
                           if(!dic.includes(tempString)){
                               dic.push(tempString);
                           }
                           /* pos = pos */
                           length++;
                       } else {
                           if(length==2){
                               pos++;
                               /* length = 2 */
                           } else {
                               pos = pos+(length-1);
                               length = 2;
                           }
                       }
                   }
                   dic.sort(function(a,b){
                       return b.length-a.length;
                   });
                   var tempStrArr = [refString];
                   for(var i=0; i<dic.length; i++)
                   {
                       //var j=0;
                       //while(j<tempStrArr.length)
                       for(var j=0; j<tempStrArr.length;){
                           if(typeof tempStrArr[j] == "string"){
                               var splitedStr = tempStrArr[j].split(dic[i]);
                               var tempSplitedStrLength = splitedStr.length;
                               for(var k=0; k<tempSplitedStrLength-1; k++){
                                  splitedStr.splice((2*k-1),0,i);
                               }
                               if(splitedStr.indexOf("")>-1){
                                 splitedStr.splice(splitedStr.indexOf(""),1);
                               }
                               tempStrArr.splice(j,1);
                               for(var k=0; k<splitedStr.length; k++){
                                 tempStrArr.splice(j+k,0,splitedStr[k]);
                               }
                               j = j+splitedStr.length;
                           } else {
                               j = j+1;
                           }
                       }
                   }
                   console.log(tempStrArr);

               };
           }


        });

        $scope.ConvertVideoId2URL = function(videoId){
            if(videoId){
                return "https://www.youtube.com/embed/" + videoId;
            } else {
                return "";
            }
        };
    }
]);

controller.filter('ConvertVideoId2URL', function(){
    return function(videoId){
        if(videoId){
            return "https://www.youtube.com/embed/" + videoId;
        } else {
            return "";
        }
    };
})