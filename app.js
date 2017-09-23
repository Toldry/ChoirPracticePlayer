/*
Alon Eitan 24/09/2017 - Don't judge my code quality here, this was as hackathony as it can get
*/
let app = angular.module('mainModule', []);

app.controller('playerController',['$scope', '$http', ($scope, $http)  => {
  $scope.playbackRate = 1;
  $scope.currentTime = 0;
  $scope.loopingEnabled = true;

  $scope.$watch('playbackRate', ()=>{
    audio.playbackRate = $scope.playbackRate;
  });

  $scope.stop = () => {
    let limits = loopControlSlider.getValue();
    audio.pause();
    audio.currentTime = limits[0];
  }
  let moveCurrentTime = (s) => {
    audio.currentTime += s;
  };

  $scope.fastBackward = moveCurrentTime.bind(null, -10);
  $scope.stepBackward = moveCurrentTime.bind(null, -3);
  $scope.stepForward = moveCurrentTime.bind(null, 3);
  $scope.fastForward = moveCurrentTime.bind(null, 10);


  $scope.uploadFile = function(event){
    let file = event.target.files[0];
    loadFileToAudio(file)
  };

  let format = (seconds) => {
    return moment.duration(seconds, 'seconds').format('m:ss', {trim:false});
  }
  let loopControlSlider = null;

  audio.addEventListener('loadedmetadata', () => {
    loopControlSlider = new Slider("#loopControlSlider", {
      id: "loopControlSlider", min: 0,
      max: audio.duration,
      range: true,
      value: [0, audio.duration] ,
      ticks: [0, audio.duration],
      ticks_positions: [0, 100],
      ticks_labels: [format(0), format(audio.duration)],
      formatter: values => {
        return format(values[0])+" — "+format(values[1])
      }
    });
  });

  audio.addEventListener('timeupdate', () => {
    let limits = loopControlSlider.getValue();
    if(audio.currentTime < limits[0] || audio.currentTime > limits[1]) {
      if(audio.currentTime > limits[1] && !$scope.loopingEnabled) {
        audio.pause()
      }

      audio.currentTime = limits[0];
    }

    $scope.currentTime = audio.currentTime;
    $scope.$digest();
  });

  $http.get('Songs/songs.json').then((res)=>{
    $scope.songs = res.data;
  });

  $scope.loadSong = (song, playAfterLoad=true) => {
    $http.get('Songs/' + song, {responseType: 'arraybuffer'}).then((res)=>{
      let file = new File([res.data], song)
      loadFileToAudio(file);
    }).then(()=>{
      if(playAfterLoad)
        audio.play();
    });
  };

  function loadFileToAudio(file) {
    let blob = window.URL || window.webkitURL;
    let fileURL = blob.createObjectURL(file);
    audio.src = fileURL;
  }

  $scope.loadSong('ChibatZion_0.mp3', false);
}]);

app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});
