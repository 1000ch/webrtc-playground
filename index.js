var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
var URL = window.URL || window.webkitURL ||  window.mozURL;
var peerConnection;

document.addEventListener('DOMContentLoaded', function () {
  var localVideo = document.querySelector('#js-local-video');
  var remoteVideo = document.querySelector('#js-remote-video');

  var config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = function onIceCandidate(e) {
    if (e.candidate) {
      var message = {
        type: 'candidate',
        label: e.candidate.sdpMLineIndex,
        id: e.candidate.sdpMid,
        candidate: e.candidate.candidate
      };
      var jsonString = JSON.stringify(message);
    } else {
      console.log('End of candidates');
    }
  };

  peerConnection.onconnecting = function onConnecting(e) {};

  peerConnection.onopen = function onOpen(e) {};

  peerConnection.onaddstream = function onAddStream(e) {};

  peerConnection.onremovestream = function onRemoveStream(e) {};
});