(function(){
  'use strict';

  var card = document.getElementById('pkCard');
  var state = {
    mode: null, code: null, questionIds: [], participantId: null,
    nickname: '', qIndex: 0, myAnswers: [], qStartedAt: null, pollTimer: null
  };

  function el(html){
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function escapeHtml(s){
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderLanding(){
    card.innerHTML =
      '<div class="pk-tabs">' +
        '<button type="button" class="pk-tab active" data-tab="create">创建房间 Create</button>' +
        '<button type="button" class="pk-tab" data-tab="join">加入房间 Join</button>' +
      '</div>' +
      '<div id="pkTabBody"></div>' +
      '<p class="pk-error" id="pkErr" hidden></p>';
    renderCreateForm();
    card.querySelectorAll('.pk-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        card.querySelectorAll('.pk-tab').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        if(btn.getAttribute('data-tab') === 'create') renderCreateForm(); else renderJoinForm();
      });
    });
  }

  function showErr(msg){
    var e = document.getElementById('pkErr');
    if(e){ e.textContent = msg; e.hidden = false; }
  }

  function renderCreateForm(){
    var body = document.getElementById('pkTabBody');
    body.innerHTML =
      '<div class="pk-field"><label>你的昵称 Your nickname</label><input id="pkNick" maxlength="12" placeholder="比如：小狐狸"></div>' +
      '<div class="pk-field"><label>选个难度 Pick a level</label>' +
        '<select id="pkTier">' +
          '<option value="g34">三四年级 · 入门智力题 Grade 3-4</option>' +
          '<option value="g7p">七年级+ · 进阶智力题 Grade 7+</option>' +
        '</select></div>' +
      '<button type="button" class="pk-btn" id="pkCreateBtn">创建房间 · 5道快题</button>';
    document.getElementById('pkCreateBtn').addEventListener('click', async function(){
      var nick = document.getElementById('pkNick').value.trim();
      var tier = document.getElementById('pkTier').value;
      if(!nick){ showErr('先填个昵称吧 / Enter a nickname first'); return; }
      this.disabled = true; this.textContent = '创建中…';
      try{
        var room = await window.PK.createRoom(5, tier);
        var joined = await window.PK.joinRoom(room.code, nick);
        state.mode = 'create'; state.code = room.code; state.questionIds = room.questionIds;
        state.participantId = joined.participantId; state.nickname = nick;
        renderShareCode();
      }catch(e){
        showErr('创建失败：' + e.message);
        this.disabled = false; this.textContent = '创建房间 · 5道快题';
      }
    });
  }

  function renderJoinForm(){
    var body = document.getElementById('pkTabBody');
    body.innerHTML =
      '<div class="pk-field"><label>房间码 Room code</label><input id="pkCode" maxlength="6" style="text-transform:uppercase;letter-spacing:.15em;" placeholder="ABCXYZ"></div>' +
      '<div class="pk-field"><label>你的昵称 Your nickname</label><input id="pkNick" maxlength="12" placeholder="比如：小浣熊"></div>' +
      '<button type="button" class="pk-btn secondary" id="pkJoinBtn">加入房间 Join</button>';
    document.getElementById('pkJoinBtn').addEventListener('click', async function(){
      var code = document.getElementById('pkCode').value.trim().toUpperCase();
      var nick = document.getElementById('pkNick').value.trim();
      if(!code || !nick){ showErr('房间码和昵称都要填 / Fill in both fields'); return; }
      this.disabled = true; this.textContent = '加入中…';
      try{
        var joined = await window.PK.joinRoom(code, nick);
        state.mode = 'join'; state.code = code; state.questionIds = joined.room.question_set;
        state.participantId = joined.participantId; state.nickname = nick;
        startPlaying();
      }catch(e){
        showErr('加入失败：' + e.message);
        this.disabled = false; this.textContent = '加入房间 Join';
      }
    });
  }

  function renderShareCode(){
    card.innerHTML =
      '<p class="pk-hint-text">把这个房间码发给朋友 Share this code with a friend</p>' +
      '<div class="pk-code-display">' + state.code + '</div>' +
      '<p class="pk-hint-text">不用等朋友加入，你可以现在就开始答题 You can start now — no need to wait.</p>' +
      '<button type="button" class="pk-btn" id="pkStartBtn">开始答题 Start</button>';
    document.getElementById('pkStartBtn').addEventListener('click', startPlaying);
  }

  function startPlaying(){
    state.qIndex = 0; state.myAnswers = [];
    renderQuestion();
  }

  function renderQuestion(){
    var q = window.PK.questionById(state.questionIds[state.qIndex]);
    state.qStartedAt = Date.now();
    var answerHtml = q.type === 'yesno'
      ? '<div class="pk-answer-row" style="gap:12px;">' +
          '<button type="button" class="pk-btn" id="pkYesBtn" style="width:auto;flex:1;padding:12px 18px;">' + escapeHtml(q.labelYes || '能 Yes') + '</button>' +
          '<button type="button" class="pk-btn secondary" id="pkNoBtn" style="width:auto;flex:1;padding:12px 18px;">' + escapeHtml(q.labelNo || '不能 No') + '</button>' +
        '</div>'
      : '<div class="pk-answer-row"><input id="pkAnsInput" placeholder="写下答案 Your answer" autocomplete="off"><button type="button" class="pk-btn" id="pkSubmitBtn" style="width:auto;padding:12px 18px;">提交</button></div>';
    card.innerHTML =
      '<div class="pk-qcount">第 ' + (state.qIndex + 1) + ' / ' + state.questionIds.length + ' 题</div>' +
      '<div class="pk-q-en">' + escapeHtml(q.en) + '</div>' +
      '<div class="pk-q-zh">' + escapeHtml(q.zh) + '</div>' +
      '<button type="button" class="pk-btn secondary" id="pkHintBtn" style="margin-top:14px;">提示 Hint</button>' +
      '<div class="pk-hint-box" id="pkHintBox" hidden></div>' +
      answerHtml +
      '<div id="pkFeedback"></div>';
    document.getElementById('pkHintBtn').addEventListener('click', function(){
      var box = document.getElementById('pkHintBox');
      box.hidden = false;
      box.textContent = q.hintZh + ' / ' + q.hintEn;
    });

    function submitAnswer(userInput){
      var seconds = Math.round((Date.now() - state.qStartedAt) / 1000);
      var correct = window.PK.checkAnswer(q, userInput);
      state.myAnswers.push({ questionId: q.id, correct: correct, seconds: seconds });
      var fb = document.getElementById('pkFeedback');
      fb.innerHTML = '<div class="pk-feedback ' + (correct ? 'correct' : 'wrong') + '">' +
        (correct ? '✓ 答对了！' : '✗ 不对——') + '<br><span style="font-weight:600;font-size:13px;">' + escapeHtml(q.answerZh) + '</span></div>' +
        '<button type="button" class="pk-btn" id="pkNextBtn" style="margin-top:12px;">' +
        (state.qIndex + 1 < state.questionIds.length ? '下一题 Next' : '完成，看结果 Finish') + '</button>';
      document.getElementById('pkNextBtn').addEventListener('click', function(){
        if(state.qIndex + 1 < state.questionIds.length){ state.qIndex++; renderQuestion(); }
        else finishAndSubmit();
      });
    }

    if(q.type === 'yesno'){
      var yesBtn = document.getElementById('pkYesBtn');
      var noBtn = document.getElementById('pkNoBtn');
      function pickYesNo(value){
        yesBtn.disabled = true; noBtn.disabled = true;
        submitAnswer(value);
      }
      yesBtn.addEventListener('click', function(){ pickYesNo(true); });
      noBtn.addEventListener('click', function(){ pickYesNo(false); });
    } else {
      var submit = document.getElementById('pkSubmitBtn');
      var input = document.getElementById('pkAnsInput');
      function doSubmit(){
        var val = input.value.trim();
        if(!val) return;
        submit.disabled = true; input.disabled = true;
        submitAnswer(val);
      }
      submit.addEventListener('click', doSubmit);
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter') doSubmit(); });
    }
  }

  async function finishAndSubmit(){
    card.innerHTML = '<p class="pk-hint-text">正在提交结果…</p>';
    try{
      await window.PK.submitAnswers(state.participantId, state.myAnswers);
      renderWaiting();
    }catch(e){
      showErrScreen('提交失败：' + e.message);
    }
  }

  function showErrScreen(msg){
    card.innerHTML = '<p class="pk-error">' + escapeHtml(msg) + '</p>';
  }

  function renderWaiting(){
    card.innerHTML =
      '<div class="pk-waiting"><span class="spin">⏳</span><p class="pk-hint-text">等待对手完成…<br>Waiting for your opponent to finish…</p></div>';
    pollForResults();
  }

  function pollForResults(){
    if(state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(async function(){
      try{
        var participants = await window.PK.getParticipants(state.code);
        var allDone = participants.length >= 2 && participants.every(function(p){
          return Array.isArray(p.answers) && p.answers.length === state.questionIds.length;
        });
        if(allDone){
          clearInterval(state.pollTimer);
          renderResults(participants);
        }
      }catch(e){ /* transient poll error, try again next tick */ }
    }, 3000);
  }

  function summarize(p){
    var correct = 0, seconds = 0;
    (p.answers || []).forEach(function(a){ if(a.correct) correct++; seconds += (a.seconds || 0); });
    return { nickname: p.nickname, correct: correct, seconds: seconds };
  }

  function renderResults(participants){
    var rows = participants.map(summarize);
    rows.sort(function(a, b){ return b.correct - a.correct || a.seconds - b.seconds; });
    var winner = rows[0];
    var html = '<p class="pk-hint-text" style="font-size:16px;"><span class="pk-winner">🏆 ' + escapeHtml(winner.nickname) + '</span> 获胜！</p>' +
      '<table class="pk-results-table"><thead><tr><th>昵称</th><th>答对</th><th>用时</th></tr></thead><tbody>' +
      rows.map(function(r){
        return '<tr><td>' + escapeHtml(r.nickname) + '</td><td>' + r.correct + '/' + state.questionIds.length + '</td><td>' + r.seconds + 's</td></tr>';
      }).join('') + '</tbody></table>' +
      '<button type="button" class="pk-btn" id="pkAgainBtn" style="margin-top:18px;">再来一局 Play again</button>';
    card.innerHTML = html;
    document.getElementById('pkAgainBtn').addEventListener('click', function(){
      state = { mode: null, code: null, questionIds: [], participantId: null, nickname: '', qIndex: 0, myAnswers: [], qStartedAt: null, pollTimer: null };
      renderLanding();
    });
  }

  renderLanding();
})();
