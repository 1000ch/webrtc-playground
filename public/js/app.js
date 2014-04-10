// fix vendor prefixed modules
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
window.URL = window.URL || window.webkitURL ||  window.mozURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new RTCPeerConnection({
  "iceServers": [{
    "url": "stun:stun.l.google.com:19302"
  }]
});
var ws = new WebSocket('ws://127.0.0.1:8124/');
var localGUID;
var remoteGUID;

document.addEventListener('DOMContentLoaded', function () {
  var $localGuid = $('#js-local-guid');
  var $clients = $('#js-clients');
  var $connect = $('#js-connect');

  navigator.getUserMedia({
      audio: false, video: true
    }, function successCallback(stream) {

      // set stream to video element
      var local = document.querySelector('#js-local-video');
      local.src = window.URL.createObjectURL(stream);

      // add stream to peer
      peer.addStream(stream);
    },
    function errorCallback(error) {
      console.log(error);
    }
  );
  
  ws.onopen = function () {

    localGUID = guid();
    $localGuid.val(localGUID).attr('disabled', 'disabled');
    ws.send(JSON.stringify({
      from: localGUID
    }));
  };

  $connect.on('click', function () {

    if (!$clients.val()) {
      alert('GUID:' + $clients.val());
    } else {
      remoteGUID = $clients.val();
    }

    peer.createOffer(function (sdp) {

      // set sdp description as local
      peer.setLocalDescription(sdp, function () {

        // send sdp to selected target
        ws.send(JSON.stringify({
          sdp: sdp,
          to: remoteGUID,
          from: localGUID
        }));
      });
    }, function (error) {
      console.log(error);
    });
  });
  
  ws.onmessage = function onMessage(e) {

    // parse json data
    var data = JSON.parse(e.data);

    var options = [];
    data.clients.filter(function (guid) {
      return (guid !== localGUID);
    }).forEach(function (guid) {
      var option = document.createElement('option');
      option.textContent = option.value = guid;
      options.push(option);
    });
    $clients.empty().append(options);

    // if target guid is not local guid
    if (data.to !== localGUID) {
      return;
    }

    // got offer
    var sdp = new RTCSessionDescription(data.sdp);

    // if type is offer
    if (sdp.type === 'offer') {

      // save sdp description as remote
      peer.setRemoteDescription(sdp, function () {

        // create answer
        peer.createAnswer(function (sdp) {

          // save sdp as local
          peer.setLocalDescription(sdp, function () {
            ws.send(JSON.stringify({
              type: MessageType.ANSWER_OFFER,
              sdp: sdp,
              from: localGUID,
              to: remoteGUID
            }));
          });
        }, function (error) {
          console.log(error);
        });
      });
    } else if (sdp.type === 'answer') {

      // save sdp description as remote
      peer.setRemoteDescription(sdp, function () {});
    }

    if (data.candidate) {
      var iceCandidate = new RTCIceCandidate(data.candidate);
      peer.addIceCandidate(iceCandidate);
    }
  };

  peer.onicecandidate = function onIceCandidate(e) {

    if (!e.candidate) {
      return;
    }

    ws.send(JSON.stringify({
      candidate: e.candidate,
      from: localGUID,
      to: remoteGUID
    }));
  };

  peer.onconnecting = function onConnecting(e) {
    //console.log(e);
  };

  peer.onopen = function onOpen(e) {
    //console.log(e);
  };

  peer.onaddstream = function onAddStream(e) {
    var remote = document.querySelector('#js-remote-video')
    remote.src = window.URL.createObjectURL(e.stream);
  };

  peer.onremovestream = function onRemoveStream(e) {
    var remote = document.querySelector('#js-remote-video');
    remote.pause();
    remote.src = null;
  };
});