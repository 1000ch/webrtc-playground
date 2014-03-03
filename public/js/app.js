
// fix vendor prefixed modules
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
window.URL = window.URL || window.webkitURL ||  window.mozURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// constant values
var SOCKET_URL = 'ws://127.0.0.1:8124/';

// variables
var peer;
var ws;
var localId;

var MessageType = {
  REGISTER: 0,
  SEND_OFFER: 1,
  ANSWER_OFFER: 2,
  SYNC_CANDIDATE: 3
};

document.addEventListener('DOMContentLoaded', function () {
  var localGuid = document.querySelector('#js-local-guid');
  var localVideo = document.querySelector('#js-local-video');
  var remoteVideo = document.querySelector('#js-remote-video');
  var guidSelect = document.querySelector('#js-guid-list');
  var connectButton = document.querySelector('#js-connect');

  var config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
  peer = new RTCPeerConnection(config);
  ws = new WebSocket(SOCKET_URL);

  navigator.getUserMedia(
    {audio: false, video: true},
    function successCallback(stream) {
      // set stream to video element
      localVideo.src = window.URL.createObjectURL(stream);
      localVideo.play();

      // add stream to peer
      peer.addStream(stream);
    },
    function errorCallback(error) {
      console.log(error);
    }
  );
  
  ws.onopen = function () {
    localId = GUID();
    $(localGuid).val(localId).attr('disabled', 'disabled');
    ws.send(JSON.stringify({
      type: MessageType.REGISTER,
      guid: localId
    }));
  };

  $(connectButton).on('click', function () {
    if (!guidSelect.value) {
      alert('GUID:' + guidSelect.value);
    };
    peer.createOffer(function (sdp) {
      // set sdp description as local
      peer.setLocalDescription(sdp, function () {
        // send sdp to selected target
        ws.send(JSON.stringify({
          type: MessageType.SEND_OFFER,
          sdp: sdp,
          to: guidSelect.options[guidSelect.selectedIndex].value
        }));
      });
    });
  });
  
  ws.onmessage = function onMessage(e) {
    var message = JSON.parse(e.data);console.log(message.type);
    switch (message.type) {
      case MessageType.REGISTER:
        var $select = $(guidSelect).empty();
        var options = [];
        message.list.filter(function (guid) {
          return (guid !== localId);
        }).forEach(function (guid) {
          var option = document.createElement('option');
          option.textContent = option.value = guid;
          options.push(option);
        });
        $select.append(options);
        break;
      case MessageType.SEND_OFFER:
        // got offer
        var sdp = new RTCSessionDescription(message.sdp);

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
                  to: localId
                }));
              });
            });
          });
        }
        break;
      case MessageType.ANSWER_OFFER:
          // got answer
          var sdp = new RTCSessionDescription(message.sdp);

          // if type is offer
          if (sdp.type === 'answer') {

            // save sdp description as remote
            peer.setRemoteDescription(sdp, function () {});
          }
      case MessageType.SYNC_CANDIDATE:
        if (message.candidate) {
          var iceCandidate = new RTCIceCandidate(message.candidate);
          peer.addIceCandidate(iceCandidate);
        }
      default:
        break;
    }
  };

  peer.onicecandidate = function onIceCandidate(e) {
    if (!e.candidate) {
      return;
    }
    ws.send(JSON.stringify({
      type: MessageType.SYNC_CANDIDATE,
      candidate: e.candidate
    }));
  };

  peer.onconnecting = function onConnecting(e) {
    //console.log(e);
  };

  peer.onopen = function onOpen(e) {
    //console.log(e);
  };

  peer.onaddstream = function onAddStream(e) {
    remoteVideo.src = window.URL.createObjectURL(e.stream);
    remoteVideo.play();
  };

  peer.onremovestream = function onRemoveStream(e) {
    remoteVideo.pause();
    remoteVideo.src = null;
  };
});