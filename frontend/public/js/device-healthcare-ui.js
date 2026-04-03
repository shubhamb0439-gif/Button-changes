(function () {
  var hiddenVoice = document.getElementById('btnVoice');
  var hiddenConnect = document.getElementById('btnConnect');
  var hiddenStream = document.getElementById('btnStream');

  var orbBtn = document.getElementById('hcOrbBtn');
  var playBtn = document.getElementById('hcPlayBtn');
  var msgBtn = document.getElementById('hcMsgBtn');

  var streamOrbBtn = document.getElementById('hcStreamOrbBtn');
  var streamPlayBtn = document.getElementById('hcStreamPlayBtn');
  var streamMsgBtn = document.getElementById('hcStreamMsgBtn');

  var msgOrbBtn = document.getElementById('hcMsgOrbBtn');
  var msgPlayBtn = document.getElementById('hcMsgPlayBtn');
  var msgMsgBtn = document.getElementById('hcMsgMsgBtn');

  var hcStreamPopup = document.getElementById('hcStreamPopup');
  var hcMsgPopup = document.getElementById('hcMsgPopup');

  var hcProfileToggle = document.getElementById('hcProfileToggle');
  var hcProfilePopup = document.getElementById('hcProfilePopup');
  var hcPopupOverlay = document.getElementById('hcPopupOverlay');
  var hcPopupConnect = document.getElementById('hcPopupConnect');

  var hcWaveCanvas = document.getElementById('hcWaveCanvas');
  var hcTranscriptCurrent = document.getElementById('hcTranscriptCurrent');
  var hcTranscriptPrev = document.getElementById('hcTranscriptPrev');
  var hcTranscriptNext = document.getElementById('hcTranscriptNext');
  var hcSummaryDisplay = document.getElementById('hcSummaryDisplay');
  var hcSummaryText = document.getElementById('hcSummaryText');

  var hcHomeWave = document.getElementById('hcHomeWave');
  var hcHomeWaveCanvas = document.getElementById('hcHomeWaveCanvas');
  var hcHomeContent = document.getElementById('hcHomeContent');

  var hcDoctorName = document.getElementById('hcDoctorName');
  var hcStreamDoctorName = document.getElementById('hcStreamDoctorName');
  var hcMsgDoctorName = document.getElementById('hcMsgDoctorName');
  var hcPopupName = document.getElementById('hcPopupName');
  var hcProfileCircle = document.getElementById('hcProfileCircle');
  var hcStreamProfileCircle = document.getElementById('hcStreamProfileCircle');
  var hcMsgProfileCircle = document.getElementById('hcMsgProfileCircle');
  var hcPopupScribeName = document.getElementById('hcPopupScribeName');
  var hcPopupScribeBadge = document.getElementById('hcPopupScribeBadge');

  var hcSoloTranscript = document.getElementById('hcSoloTranscript');
  var hcSoloTranscriptCurrent = document.getElementById('hcSoloTranscriptCurrent');
  var hcSoloTranscriptPrev = document.getElementById('hcSoloTranscriptPrev');

  var hcStreamMuteBtn = document.getElementById('hcStreamMuteBtn');
  var hcStreamHideBtn = document.getElementById('hcStreamHideBtn');
  var hcStreamPauseBtn = document.getElementById('hcStreamPauseBtn');

  var hcMsgInput = document.getElementById('hcMsgInput');
  var hcMsgSendBtn = document.getElementById('hcMsgSendBtn');
  var hcRecentMsgContent = document.getElementById('hcRecentMsgContent');
  var hcMsgHistoryContent = document.getElementById('hcMsgHistoryContent');

  var homeWaveAnimFrame = null;
  var homeWaveCtx = hcHomeWaveCanvas ? hcHomeWaveCanvas.getContext('2d') : null;

  function startHomeWaveAnimation() {
    if (!hcHomeWaveCanvas || !homeWaveCtx) return;
    if (homeWaveAnimFrame) return;

    var W = hcHomeWaveCanvas.width;
    var H = hcHomeWaveCanvas.height;
    var t = 0;

    function drawFrame() {
      homeWaveCtx.clearRect(0, 0, W, H);
      t++;

      var xrCanvas = window._xrCanvas;
      var hasLive = xrCanvas && xrCanvas.analyser && xrCanvas.listening && xrCanvas.dataArr;
      var amp = 0;

      if (hasLive) {
        xrCanvas.analyser.getByteTimeDomainData(xrCanvas.dataArr);
        var rms = 0;
        for (var i = 0; i < xrCanvas.dataArr.length; i++) {
          var v = (xrCanvas.dataArr[i] / 128) - 1;
          rms += v * v;
        }
        amp = Math.min(Math.sqrt(rms / xrCanvas.dataArr.length) * 7, 1);
      }

      var cy = H * 0.5;
      var N = 380;
      var idle = Math.max(0, 1 - amp * 1.5);

      var layers = [
        { r: 167, g: 139, b: 250, lw: 2.0, glow: 22, al: 0.95 },
        { r: 139, g: 92, b: 246, lw: 1.5, glow: 15, al: 0.54 },
        { r: 192, g: 132, b: 252, lw: 0.95, glow: 9, al: 0.27 }
      ];

      for (var li = 0; li < layers.length; li++) {
        var L = layers[li];
        var phOff = li * 1.2;
        var spd = 1 - li * 0.08;
        var xs = new Float32Array(N + 1);
        var ys = new Float32Array(N + 1);

        for (var i = 0; i <= N; i++) {
          var u = i / N;
          var ph = t * 0.011 * spd + phOff;
          var bA = H * (0.088 + li * 0.003);
          var idY =
            Math.sin(u * Math.PI * 2 * 2.2 + ph) * bA * 0.62 +
            Math.sin(u * Math.PI * 2 * 1.1 + ph * 0.70) * bA * 0.44 +
            Math.sin(u * Math.PI * 2 * 0.52 + ph * 0.36) * bA * 0.20;
          var micY = 0;
          if (hasLive && xrCanvas.dataArr) {
            var idx = Math.floor(u * (xrCanvas.dataArr.length - 1));
            var val = (xrCanvas.dataArr[idx] / 128) - 1;
            micY = val * H * 0.38 * amp + Math.sin(u * Math.PI * 2 * 2.2 + ph) * H * 0.05 * amp;
          }
          var total = idY * idle + (idY * 0.2 + micY) * amp;
          xs[i] = u * W;
          ys[i] = cy + total * Math.sin(u * Math.PI);
        }

        var makePath = function () {
          homeWaveCtx.beginPath();
          homeWaveCtx.moveTo(xs[0], ys[0]);
          for (var j = 1; j <= N; j++) homeWaveCtx.lineTo(xs[j], ys[j]);
        };

        var mkGrad = function (a) {
          var g = homeWaveCtx.createLinearGradient(0, 0, W, 0);
          g.addColorStop(0, 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',0)');
          g.addColorStop(0.07, 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',' + a + ')');
          g.addColorStop(0.50, 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',' + Math.min(a * 1.1, 1) + ')');
          g.addColorStop(0.93, 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',' + a + ')');
          g.addColorStop(1, 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',0)');
          return g;
        };

        homeWaveCtx.lineJoin = 'round';
        homeWaveCtx.lineCap = 'round';

        makePath();
        homeWaveCtx.lineWidth = L.lw * 11;
        homeWaveCtx.strokeStyle = mkGrad(L.al * 0.09);
        homeWaveCtx.shadowBlur = 0;
        homeWaveCtx.stroke();

        makePath();
        homeWaveCtx.lineWidth = L.lw * 3.8;
        homeWaveCtx.strokeStyle = mkGrad(L.al * 0.43);
        homeWaveCtx.shadowColor = 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',0.88)';
        homeWaveCtx.shadowBlur = L.glow;
        homeWaveCtx.stroke();

        makePath();
        homeWaveCtx.lineWidth = L.lw;
        homeWaveCtx.strokeStyle = mkGrad(L.al);
        homeWaveCtx.shadowColor = 'rgba(' + L.r + ',' + L.g + ',' + L.b + ',1)';
        homeWaveCtx.shadowBlur = L.glow * 0.45;
        homeWaveCtx.stroke();
      }

      homeWaveCtx.shadowBlur = 0;
      homeWaveAnimFrame = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function stopHomeWaveAnimation() {
    if (homeWaveAnimFrame) {
      cancelAnimationFrame(homeWaveAnimFrame);
      homeWaveAnimFrame = null;
    }
    if (homeWaveCtx && hcHomeWaveCanvas) {
      homeWaveCtx.clearRect(0, 0, hcHomeWaveCanvas.width, hcHomeWaveCanvas.height);
    }
  }

  function setHomeMicActive(active) {
    if (active) {
      if (hcHomeContent) hcHomeContent.classList.add('hidden');
      if (hcHomeWave) hcHomeWave.classList.add('show');
      startHomeWaveAnimation();
    } else {
      if (hcHomeContent) hcHomeContent.classList.remove('hidden');
      if (hcHomeWave) hcHomeWave.classList.remove('show');
      stopHomeWaveAnimation();
    }
  }

  var waveAnimFrame = null;
  var waveCtx = hcWaveCanvas ? hcWaveCanvas.getContext('2d') : null;

  function startStreamWaveAnimation() {
    if (!hcWaveCanvas || !waveCtx) return;
    if (waveAnimFrame) return;
    var W = hcWaveCanvas.width;
    var H = hcWaveCanvas.height;
    var t = 0;

    function draw() {
      waveCtx.clearRect(0, 0, W, H);
      t++;
      var xrCanvas = window._xrCanvas;
      var hasLive = xrCanvas && xrCanvas.analyser && xrCanvas.listening && xrCanvas.dataArr;
      var amp = 0;
      if (hasLive) {
        xrCanvas.analyser.getByteTimeDomainData(xrCanvas.dataArr);
        var rms = 0;
        for (var i = 0; i < xrCanvas.dataArr.length; i++) {
          var v = (xrCanvas.dataArr[i] / 128) - 1;
          rms += v * v;
        }
        amp = Math.min(Math.sqrt(rms / xrCanvas.dataArr.length) * 7, 1);
      }
      var cy = H * 0.5;
      for (var x = 0; x <= W; x++) {
        var u = x / W;
        var y = cy + Math.sin(u * Math.PI * 4 + t * 0.03) * H * 0.3 * (0.3 + amp * 0.7) * Math.sin(u * Math.PI);
        waveCtx.fillStyle = 'rgba(167,139,250,' + (0.6 + amp * 0.4) + ')';
        waveCtx.fillRect(x, y, 1.5, 1.5);
      }
      waveAnimFrame = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopStreamWaveAnimation() {
    if (waveAnimFrame) {
      cancelAnimationFrame(waveAnimFrame);
      waveAnimFrame = null;
    }
  }

  if (orbBtn) {
    orbBtn.addEventListener('click', function () {
      if (hiddenVoice) hiddenVoice.click();
      orbBtn.classList.toggle('active');
      var isActive = orbBtn.classList.contains('active');
      setHomeMicActive(isActive);
    });
  }

  function moveVideoToStreamPopup() {
    var preview = document.getElementById('preview');
    var wrap = document.getElementById('hcStreamVideoWrap');
    if (preview && wrap && !wrap.contains(preview)) {
      preview.hidden = false;
      preview.style.display = 'block';
      wrap.appendChild(preview);
    }
  }

  function returnVideoFromStreamPopup() {
    var preview = document.getElementById('preview');
    var wrap = document.getElementById('hcStreamVideoWrap');
    var shell = document.getElementById('shell');
    if (preview && shell && wrap && wrap.contains(preview)) {
      preview.hidden = true;
      preview.style.display = '';
      shell.appendChild(preview);
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (hiddenStream) hiddenStream.click();
      if (hcStreamPopup) hcStreamPopup.classList.add('show');
      moveVideoToStreamPopup();
      startStreamWaveAnimation();
    });
  }

  if (msgBtn) {
    msgBtn.addEventListener('click', function () {
      if (hcMsgPopup) hcMsgPopup.classList.add('show');
    });
  }

  if (streamOrbBtn) {
    streamOrbBtn.addEventListener('click', function () {
      if (hiddenVoice) hiddenVoice.click();
      streamOrbBtn.classList.toggle('active');
      if (orbBtn) orbBtn.classList.toggle('active');
      var isActive = streamOrbBtn.classList.contains('active');
      setHomeMicActive(isActive);
    });
  }

  if (streamPlayBtn) {
    streamPlayBtn.addEventListener('click', function () {
      if (hiddenStream) hiddenStream.click();
      if (hcStreamPopup) hcStreamPopup.classList.remove('show');
      returnVideoFromStreamPopup();
      stopStreamWaveAnimation();
    });
  }

  if (streamMsgBtn) {
    streamMsgBtn.addEventListener('click', function () {
      if (hcStreamPopup) hcStreamPopup.classList.remove('show');
      returnVideoFromStreamPopup();
      stopStreamWaveAnimation();
      if (hcMsgPopup) hcMsgPopup.classList.add('show');
    });
  }

  if (msgOrbBtn) {
    msgOrbBtn.addEventListener('click', function () {
      if (hiddenVoice) hiddenVoice.click();
      if (orbBtn) orbBtn.classList.toggle('active');
      var isActive = orbBtn && orbBtn.classList.contains('active');
      setHomeMicActive(isActive);
    });
  }

  if (msgPlayBtn) {
    msgPlayBtn.addEventListener('click', function () {
      if (hcMsgPopup) hcMsgPopup.classList.remove('show');
      if (hiddenStream) hiddenStream.click();
      if (hcStreamPopup) hcStreamPopup.classList.add('show');
      moveVideoToStreamPopup();
      startStreamWaveAnimation();
    });
  }

  if (msgMsgBtn) {
    msgMsgBtn.addEventListener('click', function () {
      if (hcMsgPopup) hcMsgPopup.classList.remove('show');
    });
  }

  if (hcProfileToggle) {
    hcProfileToggle.addEventListener('click', function () {
      if (hcProfilePopup) hcProfilePopup.classList.toggle('show');
      if (hcPopupOverlay) hcPopupOverlay.classList.toggle('show');
    });
  }

  if (hcPopupOverlay) {
    hcPopupOverlay.addEventListener('click', function () {
      if (hcProfilePopup) hcProfilePopup.classList.remove('show');
      if (hcPopupOverlay) hcPopupOverlay.classList.remove('show');
    });
  }

  if (hcPopupConnect) {
    hcPopupConnect.addEventListener('click', function () {
      if (hiddenConnect) hiddenConnect.click();
    });
  }

  if (hcStreamMuteBtn) {
    hcStreamMuteBtn.addEventListener('click', function () {
      var hiddenMute = document.getElementById('btnMute');
      if (hiddenMute) hiddenMute.click();
      hcStreamMuteBtn.classList.toggle('active');
      hcStreamMuteBtn.textContent = hcStreamMuteBtn.classList.contains('active') ? 'Unmute' : 'Mute';
    });
  }

  if (hcStreamHideBtn) {
    hcStreamHideBtn.addEventListener('click', function () {
      var hiddenVideo = document.getElementById('btnVideo');
      if (hiddenVideo) hiddenVideo.click();
      hcStreamHideBtn.classList.toggle('active');
      hcStreamHideBtn.textContent = hcStreamHideBtn.classList.contains('active') ? 'Show' : 'Hide';
    });
  }

  if (hcStreamPauseBtn) {
    hcStreamPauseBtn.addEventListener('click', function () {
      hcStreamPauseBtn.classList.toggle('active');
      hcStreamPauseBtn.textContent = hcStreamPauseBtn.classList.contains('active') ? 'Resume' : 'Pause';
    });
  }

  if (hcMsgSendBtn && hcMsgInput) {
    hcMsgSendBtn.addEventListener('click', function () {
      var text = (hcMsgInput.value || '').trim();
      if (!text) return;
      var hiddenMsgInput = document.getElementById('msgInput');
      var hiddenSend = document.getElementById('btnSend');
      if (hiddenMsgInput) hiddenMsgInput.value = text;
      if (hiddenSend) hiddenSend.click();
      hcMsgInput.value = '';
      hcMsgInput.placeholder = 'Type your message.....';
      replyingTo = null;
      var indicator = document.querySelector('.hc-reply-indicator');
      if (indicator) indicator.remove();
    });

    hcMsgInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        hcMsgSendBtn.click();
      }
    });
  }

  function syncDoctorInfo() {
    try {
      var xrId = window.XR_DEVICE_ID || '';
      var xrDisplay = document.getElementById('xrIdDisplay');
      var displayName = (xrDisplay && xrDisplay.value) || xrId || '';

      if (hcDoctorName) hcDoctorName.textContent = displayName;
      if (hcStreamDoctorName) hcStreamDoctorName.textContent = displayName;
      if (hcMsgDoctorName) hcMsgDoctorName.textContent = displayName;
      if (hcPopupName) hcPopupName.textContent = displayName || 'Doctor';

      var statusEl = document.getElementById('status');
      var isConnected = statusEl && statusEl.textContent.indexOf('Connected') > -1 && statusEl.textContent.indexOf('Disconnected') === -1;

      if (hcProfileCircle) hcProfileCircle.classList.toggle('disconnected', !isConnected);
      if (hcStreamProfileCircle) hcStreamProfileCircle.classList.toggle('disconnected', !isConnected);
      if (hcMsgProfileCircle) hcMsgProfileCircle.classList.toggle('disconnected', !isConnected);

      if (hcPopupConnect) {
        if (isConnected) {
          hcPopupConnect.textContent = 'Disconnect';
          hcPopupConnect.classList.add('connected');
        } else {
          hcPopupConnect.textContent = 'Connect';
          hcPopupConnect.classList.remove('connected');
        }
      }

      var peerStatusEl = document.getElementById('peerStatusText');
      if (hcPopupScribeName && peerStatusEl) {
        var peerText = peerStatusEl.textContent || '';
        var scribeName = peerText.replace(' is Online', '').replace(' is Offline', '').trim();
        if (scribeName && scribeName !== 'Peer') {
          hcPopupScribeName.textContent = scribeName;
          var isOnline = peerText.indexOf('Online') > -1;
          if (hcPopupScribeBadge) {
            hcPopupScribeBadge.textContent = isOnline ? 'Online' : 'Offline';
            hcPopupScribeBadge.className = 'status-badge ' + (isOnline ? 'online' : 'offline');
          }
        }
      }
    } catch (e) {}
  }

  setInterval(syncDoctorInfo, 1000);
  setTimeout(syncDoctorInfo, 500);

  var replyingTo = null;

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function parseMsgElement(el) {
    var isSystem = el.dataset.isSystem === '1';
    var sender = '';
    var time = '';
    var text = '';

    if (isSystem) {
      var pillEl = el.querySelector('.msg-system-pill');
      var sysTimeEl = el.querySelector('.msg-system-time');
      if (pillEl) text = pillEl.textContent.trim();
      if (sysTimeEl) time = sysTimeEl.textContent.trim();
      sender = 'System';
      return { sender: sender, time: time, text: text, isSystem: true };
    }

    var senderEl = el.querySelector('.msg-header');
    var timeEl = el.querySelector('.msg-timestamp');
    var textEl = el.querySelector('.msg-text');
    if (senderEl) {
      var clone = senderEl.cloneNode(true);
      var badge = clone.querySelector('.msg-badge-urgent');
      if (badge) badge.remove();
      sender = clone.textContent.trim();
    }
    if (timeEl) time = timeEl.textContent.trim();
    if (textEl) text = textEl.textContent.trim();
    return { sender: sender, time: time, text: text, isSystem: false };
  }

  function buildChatBubble(parsed, idx) {
    if (parsed.isSystem) {
      var sysEl = document.createElement('div');
      sysEl.className = 'hc-system-notification';
      sysEl.innerHTML = '<span class="hc-system-pill">' + escHtml(parsed.text) + '</span>' +
        (parsed.time ? '<div class="hc-system-time">' + escHtml(parsed.time) + '</div>' : '');
      return sysEl;
    }

    var isMine = window.XR_DEVICE_ID && (
      parsed.sender === window.XR_DEVICE_ID ||
      parsed.sender === (window._myFullName || '') ||
      parsed.sender === 'Me'
    );
    var bubble = document.createElement('div');
    bubble.className = 'hc-chat-bubble ' + (isMine ? 'hc-chat-mine' : 'hc-chat-theirs');
    bubble.dataset.idx = idx;

    var inner = '';
    if (!isMine && parsed.sender) {
      inner += '<div class="hc-chat-sender">' + escHtml(parsed.sender) + '</div>';
    }
    inner += '<div class="hc-chat-text">' + escHtml(parsed.text) + '</div>';
    inner += '<div class="hc-chat-meta">';
    if (parsed.time) inner += '<span class="hc-chat-time">' + escHtml(parsed.time) + '</span>';
    inner += '<button class="hc-chat-reply-btn" data-idx="' + idx + '">Reply</button>';
    inner += '</div>';
    bubble.innerHTML = inner;

    var replyBtn = bubble.querySelector('.hc-chat-reply-btn');
    if (replyBtn) {
      replyBtn.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-idx'));
        replyingTo = i;
        if (hcMsgInput) {
          hcMsgInput.focus();
          hcMsgInput.placeholder = 'Replying to: ' + escHtml(parsed.text.slice(0, 40)) + (parsed.text.length > 40 ? '...' : '');
        }
        var existing = document.querySelector('.hc-reply-indicator');
        if (existing) existing.remove();
        var indicator = document.createElement('div');
        indicator.className = 'hc-reply-indicator';
        indicator.innerHTML = '<span>Replying to <strong>' + escHtml(parsed.sender) + '</strong>: ' + escHtml(parsed.text.slice(0, 60)) + '</span><button class="hc-reply-cancel">×</button>';
        var inputArea = document.querySelector('.hc-msg-input-area');
        if (inputArea) inputArea.insertAdjacentElement('beforebegin', indicator);
        var cancelBtn = indicator.querySelector('.hc-reply-cancel');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function() {
            replyingTo = null;
            indicator.remove();
            if (hcMsgInput) hcMsgInput.placeholder = 'Type your message.....';
          });
        }
      });
    }

    return bubble;
  }

  var lastRenderedCount = 0;

  function syncTranscripts() {
    try {
      var hiddenMsgList = document.getElementById('msgList');
      if (!hiddenMsgList) return;

      var items = hiddenMsgList.querySelectorAll('.msg');

      if (items.length === 0) {
        if (hcRecentMsgContent) hcRecentMsgContent.innerHTML = '';
        if (hcMsgHistoryContent) hcMsgHistoryContent.innerHTML = '';
        lastRenderedCount = 0;
        return;
      }

      var last = items[items.length - 1];
      var lastParsed = parseMsgElement(last);

      if (hcTranscriptCurrent) hcTranscriptCurrent.textContent = lastParsed.text;
      if (hcSoloTranscriptCurrent) hcSoloTranscriptCurrent.textContent = lastParsed.text;

      if (items.length >= 2) {
        var prevParsed = parseMsgElement(items[items.length - 2]);
        if (hcTranscriptPrev) hcTranscriptPrev.textContent = prevParsed.text;
        if (hcSoloTranscriptPrev) hcSoloTranscriptPrev.textContent = prevParsed.text;
      }

      if (items.length === lastRenderedCount) return;
      lastRenderedCount = items.length;

      var RECENT_COUNT = 5;
      var recentStart = Math.max(0, items.length - RECENT_COUNT);

      if (hcRecentMsgContent) {
        hcRecentMsgContent.innerHTML = '';
        for (var i = recentStart; i < items.length; i++) {
          var parsed = parseMsgElement(items[i]);
          hcRecentMsgContent.appendChild(buildChatBubble(parsed, i));
        }
      }

      if (hcMsgHistoryContent) {
        hcMsgHistoryContent.innerHTML = '';
        if (recentStart > 0) {
          for (var j = 0; j < recentStart; j++) {
            var hParsed = parseMsgElement(items[j]);
            hcMsgHistoryContent.appendChild(buildChatBubble(hParsed, j));
          }
        }
      }
    } catch (e) {}
  }

  setInterval(syncTranscripts, 800);
})();
