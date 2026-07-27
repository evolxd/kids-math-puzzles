var TIER_PREFIX = window.TIER_PREFIX || 'all';
(function(){

  var KEY = 'thinking.' + TIER_PREFIX + '.solved.v1';
  var solved = {};
  try { solved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){}

  var DATES_KEY = 'thinking.' + TIER_PREFIX + '.dates.v1';
  var dates = {};
  try { dates = JSON.parse(localStorage.getItem(DATES_KEY) || '{}'); } catch(e){}
  function saveDates(){ localStorage.setItem(DATES_KEY, JSON.stringify(dates)); }

  var GRADES_KEY = 'thinking.' + TIER_PREFIX + '.grades.v1';
  var grades = {};
  try { grades = JSON.parse(localStorage.getItem(GRADES_KEY) || '{}'); } catch(e){}
  function saveGrades(){ localStorage.setItem(GRADES_KEY, JSON.stringify(grades)); }

  function todayStr(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  var worldIds = window.WORLD_IDS || ['m1','m2','m3','m4','m5','m6'];
  var totals = window.WORLD_TOTALS || {m1:17,m2:16,m3:17,m4:17,m5:16,m6:17};

  function save(){ localStorage.setItem(KEY, JSON.stringify(solved)); }

  function render(){
    var total = 0, done = 0;
    worldIds.forEach(function(w){
      var count = 0;
      document.querySelectorAll('.quest[data-q^="'+w+'-"]').forEach(function(q){
        var id = q.getAttribute('data-q');
        var cb = q.querySelector('input[type="checkbox"]');
        var isSolved = !!solved[id];
        cb.checked = isSolved;
        q.classList.toggle('solved', isSolved);
        if(isSolved) count++;
      });
      total += totals[w];
      done += count;
      var pct = Math.round(100 * count / totals[w]);
      var track = document.querySelector('.map i[data-prog="'+w+'"]');
      if(track) track.style.width = pct + '%';
      var label = document.querySelector('.map span[data-count="'+w+'"]');
      if(label) label.textContent = count + '/' + totals[w];
    });
    document.getElementById('hudCount').textContent = done;
    document.getElementById('hudFill').style.width = Math.round(100*done/total) + '%';
  }

  document.querySelectorAll('.quest').forEach(function(q){
    var id = q.getAttribute('data-q');
    var cb = q.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', function(){
      solved[id] = cb.checked;
      save();
      if(cb.checked && !dates[id]){
        dates[id] = todayStr();
        saveDates();
      }
      render();
    });
  });

  document.getElementById('resetBtn').addEventListener('click', function(){
    if(confirm('确定要清空当前的打卡勾选吗？做题历史和批改记录不会丢失，家长中心随时能看到。\nClear the checkmarks? Your history and grades stay intact in the Parent Center.')){
      solved = {};
      save();
      render();
    }
  });

  // answers (child's written responses), saved alongside checkbox progress
  var ANSWERS_KEY = 'thinking.' + TIER_PREFIX + '.answers.v1';
  var answers = {};
  try { answers = JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}'); } catch(e){}
  function saveAnswers(){ localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers)); }

  document.querySelectorAll('.quest').forEach(function(q){
    var id = q.getAttribute('data-q');
    var input = q.querySelector('.answer-input');
    if(answers[id]) input.value = answers[id];
    input.addEventListener('input', function(){
      answers[id] = input.value;
      saveAnswers();
    });
  });

  // parent report
  var worldNames = {
    m1:['称重与信息推理','Weighing & Information Logic'],
    m2:['组合与计数思维','Combinatorics & Counting'],
    m3:['逻辑推演谜题','Deductive Logic Puzzles'],
    m4:['空间与几何思维','Spatial & Geometric Thinking'],
    m5:['数字游戏与数论','Number Games & Number Theory'],
    m6:['策略博弈与决策','Game Strategy & Optimal Decisions'],
    m7:['AI时代思维','AI-Era Thinking']
  };

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildReport(){
    var textLines = [];
    var bodyHtml = '';
    var doneCount = 0, totalCount = 0, gradedCount = 0, correctCount = 0;
    var gradeLabel = {correct:'[✓对/Correct] ', incorrect:'[✗错/Incorrect] '};

    worldIds.forEach(function(w){
      var name = worldNames[w];
      var worldTextLines = [];
      var worldHtml = '<div class="report-world"><h3>' + name[0] + ' · ' + name[1] + '</h3>';

      document.querySelectorAll('.quest[data-q^="'+w+'-"]').forEach(function(q){
        var id = q.getAttribute('data-q');
        var isSolved = !!solved[id];
        var grade = grades[id];
        var zh = q.querySelector('.zh').textContent.trim();
        var en = q.querySelector('.en').textContent.trim();
        var ans = (answers[id] || '').trim();
        totalCount++;
        if(isSolved) doneCount++;
        if(isSolved && grade){ gradedCount++; if(grade === 'correct') correctCount++; }

        worldTextLines.push((isSolved ? '[完成] ' : '[未做] ') + (grade ? gradeLabel[grade] : '') + zh);
        worldTextLines.push('  ' + en);
        if(ans) worldTextLines.push('  答案 / Answer: ' + ans);

        worldHtml += '<div class="report-item ' + (isSolved ? 'done' : 'pending') + '">' +
          '<div class="rq">' + (grade ? escapeHtml(gradeLabel[grade]) : '') + escapeHtml(zh) + '</div>' +
          (ans ? '<div class="ra">' + escapeHtml(ans) + '</div>' : '') +
          '</div>';
      });

      worldHtml += '</div>';
      bodyHtml += worldHtml;
      textLines.push('【' + name[0] + ' · ' + name[1] + '】');
      textLines = textLines.concat(worldTextLines);
      textLines.push('');
    });

    var header = [
      '思维闯关 100题 · 做题报告 (Progress Report)',
      '生成时间 / Generated: ' + new Date().toLocaleString(),
      '完成进度 / Completed: ' + doneCount + ' / ' + totalCount,
    ];
    if(gradedCount > 0){
      header.push('正确率 / Accuracy (graded only): ' + correctCount + ' / ' + gradedCount + ' (' + Math.round(100*correctCount/gradedCount) + '%)');
    }
    header.push('');

    return { text: header.concat(textLines).join('\n'), html: bodyHtml, done: doneCount, total: totalCount };
  }

  var reportOverlay = document.getElementById('reportOverlay');
  var reportBody = document.getElementById('reportBody');
  var reportCopyNote = document.getElementById('reportCopyNote');
  var lastReportText = '';

  document.getElementById('reportBtn').addEventListener('click', function(){
    var r = buildReport();
    lastReportText = r.text;
    reportBody.innerHTML = r.html;
    reportCopyNote.textContent = '';
    reportOverlay.classList.add('open');
  });
  document.getElementById('reportClose').addEventListener('click', function(){
    reportOverlay.classList.remove('open');
  });
  reportOverlay.addEventListener('click', function(e){
    if(e.target === reportOverlay) reportOverlay.classList.remove('open');
  });

  document.getElementById('reportCopyBtn').addEventListener('click', function(){
    function ok(){ reportCopyNote.textContent = '已复制！粘贴到微信或邮件发给家长吧。Copied — paste it into a message or email.'; }
    function fail(){ reportCopyNote.textContent = '复制失败，请手动选中文字复制。Copy failed — please select the text manually.'; }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(lastReportText).then(ok, fail);
    } else {
      var ta = document.createElement('textarea');
      ta.value = lastReportText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch(e){ fail(); }
      document.body.removeChild(ta);
    }
  });

  document.getElementById('reportDownloadBtn').addEventListener('click', function(){
    var blob = new Blob([lastReportText], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '思维闯关做题报告-' + new Date().toISOString().slice(0,10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // parent center: daily stats + per-question grading
  var parentOverlay = document.getElementById('parentOverlay');
  var parentBody = document.getElementById('parentBody');

  var currentGranularity = 'day';
  var GRAN_LABEL = {day:'天', week:'周', month:'月', year:'年'};
  var GRAN_CAP = {day:14, week:8, month:12, year:5};

  function pad2(n){ return String(n).padStart(2,'0'); }
  function addDays(dateStr, n){
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
  }
  function isoWeekStart(dateStr){
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDay();
    var diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
  }
  function bucketKey(dateStr, gran){
    if(gran === 'week') return isoWeekStart(dateStr);
    if(gran === 'month') return dateStr.slice(0,7);
    if(gran === 'year') return dateStr.slice(0,4);
    return dateStr;
  }
  function bucketLabel(key, gran){
    if(gran === 'week') return key.slice(5) + '~' + addDays(key,6).slice(5);
    if(gran === 'day') return key.slice(5);
    return key;
  }

  function computeStats(gran){
    var byKey = {};
    Object.keys(dates).forEach(function(id){
      var k = bucketKey(dates[id], gran);
      if(!byKey[k]) byKey[k] = {attempted:0, graded:0, correct:0};
      byKey[k].attempted++;
      var g = grades[id];
      if(g){ byKey[k].graded++; if(g === 'correct') byKey[k].correct++; }
    });
    return byKey;
  }

  function svgBarChart(buckets, color, maxValue, valueFmt){
    var w = 640, h = 130, padBottom = 26, padTop = 18, padSide = 6, barGap = 6;
    var n = buckets.length;
    var barW = n > 0 ? Math.max(10, (w - padSide*2 - barGap*(n-1)) / n) : 0;
    var bars = buckets.map(function(b, i){
      var x = padSide + i*(barW+barGap);
      if(b.value === null){
        return '<text x="' + (x+barW/2).toFixed(1) + '" y="' + (h-8) + '" text-anchor="middle" class="chart-lbl">' + escapeHtml(b.label) + '</text>';
      }
      var bh = Math.max(2, Math.round((h - padTop - padBottom) * (b.value / maxValue)));
      var y = h - padBottom - bh;
      return '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + barW.toFixed(1) + '" height="' + bh + '" rx="3" fill="' + color + '"><title>' + escapeHtml(b.title) + '</title></rect>' +
        '<text x="' + (x+barW/2).toFixed(1) + '" y="' + (y-4) + '" text-anchor="middle" class="chart-val">' + valueFmt(b.value) + '</text>' +
        '<text x="' + (x+barW/2).toFixed(1) + '" y="' + (h-8) + '" text-anchor="middle" class="chart-lbl">' + escapeHtml(b.label) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" class="pc-chart">' +
      '<line x1="' + padSide + '" y1="' + (h-padBottom) + '" x2="' + (w-padSide) + '" y2="' + (h-padBottom) + '" class="chart-axis"/>' +
      bars +
    '</svg>';
  }

  function buildStatsSection(gran){
    var byKey = computeStats(gran);
    var allKeys = Object.keys(byKey).sort();
    var gLabel = GRAN_LABEL[gran];

    var tabsHtml = '<div class="pc-tabs">' + Object.keys(GRAN_LABEL).map(function(g){
      return '<button type="button" class="pc-tab' + (g===gran?' active':'') + '" data-gran="' + g + '">按' + GRAN_LABEL[g] + '</button>';
    }).join('') + '</div>';

    if(allKeys.length === 0){
      return tabsHtml + '<p class="pc-empty">还没有打卡记录。No progress yet.</p>';
    }

    var cap = GRAN_CAP[gran];
    var recentKeys = allKeys.slice(-cap);
    var chartBuckets = recentKeys.map(function(k){
      var s = byKey[k];
      return {label: bucketLabel(k, gran), value: s.attempted, title: k + '：完成' + s.attempted + '题'};
    });
    var accBuckets = recentKeys.map(function(k){
      var s = byKey[k];
      var rate = s.graded > 0 ? Math.round(100*s.correct/s.graded) : null;
      return {label: bucketLabel(k, gran), value: rate, title: k + '：' + (rate===null ? '还没有批改' : ('正确率' + rate + '%（' + s.correct + '/' + s.graded + '）'))};
    });
    var maxAttempted = Math.max(1, chartBuckets.reduce(function(m,b){ return Math.max(m,b.value); }, 1));

    var noteHtml = allKeys.length > cap ? '<p class="pc-chart-note">图表只显示最近 ' + cap + ' 个' + gLabel + '，共有 ' + allKeys.length + ' 个' + gLabel + '的记录（下方表格是完整历史）。</p>' : '';

    var chartsHtml =
      '<div class="pc-chart-title">完成题数 · Questions done</div>' +
      '<div class="pc-chart-wrap">' + svgBarChart(chartBuckets, 'var(--brand)', maxAttempted, function(v){ return v; }) + '</div>' +
      '<div class="pc-chart-title">正确率 · Accuracy</div>' +
      '<div class="pc-chart-wrap">' + svgBarChart(accBuckets, 'var(--good)', 100, function(v){ return v + '%'; }) + '</div>' +
      noteHtml;

    var totalAttempted=0, totalGraded=0, totalCorrect=0;
    var rows = allKeys.slice().reverse().map(function(k){
      var s = byKey[k];
      totalAttempted += s.attempted; totalGraded += s.graded; totalCorrect += s.correct;
      var rate = s.graded > 0 ? Math.round(100*s.correct/s.graded) + '%' : '—';
      return '<tr><td>' + k + '</td><td>' + s.attempted + '</td><td>' + s.graded + '</td><td>' + s.correct + '</td><td>' + rate + '</td></tr>';
    }).join('');
    var totalRate = totalGraded > 0 ? Math.round(100*totalCorrect/totalGraded) + '%' : '—';
    var tableHtml = '<table class="pc-stats"><thead><tr><th>' + gLabel + '</th><th>完成 Done</th><th>已批改 Graded</th><th>正确 Correct</th><th>正确率 Rate</th></tr></thead><tbody>' +
      rows + '<tr class="pc-total"><td>合计 Total</td><td>' + totalAttempted + '</td><td>' + totalGraded + '</td><td>' + totalCorrect + '</td><td>' + totalRate + '</td></tr></tbody></table>';

    return tabsHtml + chartsHtml + tableHtml;
  }

  function buildParentCenter(){
    var statsHtml = '<div class="pc-section"><h3>历史统计 · History Stats</h3>' + buildStatsSection(currentGranularity) + '</div>';

    var gradeHtml = '<div class="pc-section"><h3>逐题批改 · Grade Answers</h3>';
    var solvedIds = Object.keys(solved).filter(function(id){ return solved[id]; }).sort();
    if(solvedIds.length === 0){
      gradeHtml += '<p class="pc-empty">孩子还没有打卡任何题目。No questions checked off yet.</p>';
    } else {
      gradeHtml += '<div class="pc-grade-list">';
      solvedIds.forEach(function(id){
        var q = document.querySelector('.quest[data-q="'+id+'"]');
        if(!q) return;
        var zh = q.querySelector('.zh').textContent.trim();
        var childAns = (answers[id] || '').trim();
        var help = HELP[id];
        var refAns = help ? (help[3] + ' / ' + help[2]) : '（无参考答案 no reference）';
        var grade = grades[id] || '';
        gradeHtml += '<div class="pc-grade-row" data-q="' + id + '">' +
          '<div class="pc-q"><span class="id">' + id + '</span>' + escapeHtml(zh) + '</div>' +
          '<div class="pc-answer-block"><div class="pc-label">孩子的答案 Child\'s answer</div><div class="pc-child-ans' + (childAns ? '' : ' empty') + '">' + (childAns ? escapeHtml(childAns) : '（没有写答案 no written answer）') + '</div></div>' +
          '<div class="pc-answer-block"><div class="pc-label">参考答案 Reference answer</div><div class="pc-ref-ans">' + escapeHtml(refAns) + '</div></div>' +
          '<div class="pc-grade-btns">' +
            '<button type="button" class="grade-btn correct' + (grade==='correct'?' active':'') + '" data-grade="correct">✓ 正确 Correct</button>' +
            '<button type="button" class="grade-btn incorrect' + (grade==='incorrect'?' active':'') + '" data-grade="incorrect">✗ 错误 Incorrect</button>' +
          '</div>' +
        '</div>';
      });
      gradeHtml += '</div>';
    }
    gradeHtml += '</div>';

    parentBody.innerHTML = statsHtml + gradeHtml;
  }

  document.getElementById('parentBtn').addEventListener('click', function(){
    buildParentCenter();
    parentOverlay.classList.add('open');
  });
  document.getElementById('parentClose').addEventListener('click', function(){
    parentOverlay.classList.remove('open');
  });
  parentOverlay.addEventListener('click', function(e){
    if(e.target === parentOverlay) parentOverlay.classList.remove('open');
  });
  parentBody.addEventListener('click', function(e){
    var tab = e.target.closest('.pc-tab');
    if(tab){
      currentGranularity = tab.getAttribute('data-gran');
      buildParentCenter();
      return;
    }
    var btn = e.target.closest('.grade-btn');
    if(!btn) return;
    var row = btn.closest('.pc-grade-row');
    var id = row.getAttribute('data-q');
    var g = btn.getAttribute('data-grade');
    if(grades[id] === g){
      delete grades[id];
    } else {
      grades[id] = g;
    }
    saveGrades();
    buildParentCenter();
  });

  // hints & answers: [hintEN, hintZH, answerEN, answerZH]
  var HELP = {
    "m1-01": ["Put one ball on each side of the scale, leaving the third one aside.", "把其中2个球放在天平两边——留第三个不称。", "Weigh ball A vs ball B. Whichever side is heavier is the answer. If they balance, the answer is ball C, the one you left aside.", "把A和B放在天平两边称。哪边重答案就是那个球；如果平衡，答案就是没称的C球。"],
    "m1-02": ["With 1 weighing you only get 3 possible results (left heavier, right heavier, or balanced) — how many balls can that really tell apart?", "1次称重只有3种结果（左重、右重、平衡）——这最多能区分几个球？", "The max is 3. With 4 balls, at least 2 must be left off the scale no matter how you split them, and a balanced result can't tell you which of those 2 is heavier.", "最多3个。4个球不管怎么分，至少有2个没称，如果平衡了也无法判断这2个里到底谁重。"],
    "m1-03": ["Split into three groups first so one weighing narrows things down to a small group.", "先分成三堆，第一次称重就能把范围缩到一小堆。", "Split into 3, 3, 2. Weigh 3 vs 3. If balanced, the heavier ball is in the leftover 2 (weigh those against each other). If unbalanced, take the heavier group of 3 and weigh 1 against another, leaving 1 aside.", "分成3、3、2三堆。先称3vs3：平衡的话答案在剩下2个里，互称一次就找到；不平衡就从较重的3个里拿2个互称（留1个）。"],
    "m1-04": ["Same idea as 8 balls, but now the groups can be perfectly even.", "跟8个球思路一样，但这次可以分成完全相等的三堆。", "Split into 3, 3, 3. Weigh group1 vs group2. Balanced means the fake is in group3; unbalanced means it's in the heavier group. Then weigh 1 vs 1 from that group of 3 (leaving 1 aside).", "分成3、3、3三堆。称第一堆vs第二堆：平衡答案在第三堆，不平衡在较重那堆。再从这3个里挑2个互称（留1个）即可。"],
    "m1-05": ["Always guess the middle of what's left — how many times can you cut 20 in half?", "每次都猜剩余范围的正中间——20能对半砍几次？", "Binary search: guess 10, then 5 or 15, and so on. Each guess roughly halves the range, and 2^5=32, which covers 20, so 5 guesses always suffice.", "用二分法：先猜10，再猜5或15，以此类推。每猜一次范围减半，2^5=32覆盖了20，所以5次一定够。"],
    "m1-06": ["Same halving idea, just scaled up — what power of 2 first reaches 100?", "同样是对半猜的思路——2的几次方第一次超过100？", "Binary search again: guess 50 first. 2^7=128, which covers 100, so 7 guesses always suffice.", "同样用二分法，先猜50。2^7=128覆盖了100，所以7次一定够。"],
    "m1-07": ["Whichever box you open, the ball you draw tells you the truth about THAT box too.", "不管打开哪个盒子，摸出的球能告诉你这个盒子真正装的是什么。", "Draw one ball from either box. Since both labels are known to be wrong, the color you draw is that box's true, full content, so swap both labels.", "从任意一个盒子摸一个球。既然两个标签都错了，摸出的颜色就是这个盒子真正的内容，把两个标签互换即可。"],
    "m1-08": ["Only the box labeled Mixed can be reasoned about safely. Why?", "只有贴着混合标签的盒子能放心推理——为什么？", "Open the box labeled Mixed (it can't really be mixed, since the label is wrong). The single fruit you draw tells you it's all that fruit. The box labeled with the OTHER fruit can't be that fruit and can't be all-that-fruit either, so it must be Mixed. The last box is whatever's left.", "打开贴着混合标签的盒子（标签错了，它不可能真是混合的）。摸出什么水果，这盒就全是那种水果。贴着另一种水果标签的盒子既不可能是那种水果，也不可能是刚确定的那种，所以它是混合，剩下那盒就是答案。"],
    "m1-09": ["Split into three groups of 4 first — one weighing narrows it to a single group of 4.", "先分成4、4、4三堆，第一次称重就能锁定其中一堆。", "Weigh group1 (4) vs group2 (4). The heavier side, or the leftover group if balanced, has the fake. Take those 4, weigh 2 vs 2, then weigh 1 vs 1 from the heavier pair.", "称第一堆(4个)vs第二堆(4个)：哪边重就在哪堆（平衡则在没称的那堆）。再从这4个里称2vs2，最后从较重的2个里称1vs1。"],
    "m1-10": ["Weights can go on either pan — what if a weight sits on the SAME side as the object? Does that effectively subtract?", "砝码可以放两边——如果和物体放同一边，是不是相当于'减去'它？", "Every number 1-13 can be written using -1, 0, or +1 times 1, 3, and 9. To weigh 5g: put the object with the 3g and 1g weights on one side, and the 9g weight alone on the other, since 5 = 9-3-1.", "1到13的每个整数都能写成1、3、9乘以-1、0、+1的组合。称5克：物体和3克、1克砝码放一边，9克砝码放另一边，因为5=9-3-1。"],
    "m1-11": ["Same trick as the 1,3,9 weights, just with one more weight added.", "跟1、3、9的砝码是同一个技巧，只是多加了一个。", "The same -1/0/+1 trick with 1, 3, 9, 27 covers every gram from 1-40. For 5g: 5 = 9-3-1, so the object plus the 3g and 1g weights go on one side, the 9g weight on the other (27g isn't needed here).", "同样的-1/0/+1技巧用1、3、9、27能称出1-40克所有整数重量。称5克：5=9-3-1，物体加3克、1克砝码放一边，9克放另一边（27克这次用不上）。"],
    "m1-12": ["With 3 balls and no idea which is heavier or lighter, weigh 2 of them and leave 1 aside first.", "3个球不知道谁重谁轻，先称其中2个，留1个不称。", "Weigh A vs B. If they balance, C is the fake; weigh it against A to learn if it's heavy or light. If they don't balance, weigh A against a known-normal ball (C, once you know it's not the fake): balanced means B is the fake, unbalanced means A is.", "称A vs B。如果平衡，C是假球——再拿C跟A称一次，就知道偏重还是偏轻。如果不平衡，拿A跟已知是真的C再称一次：平衡说明B是假球，不平衡说明A是假球。"],
    "m1-13": ["Don't jump the same number of floors every time — the gap should shrink by 1 each try so a break never costs extra total attempts.", "每次跳的层数不要一样——间隔每次少1层，这样万一碎了也不会多花次数。", "Drop from floor 14, then 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100 (gaps of 14, 13, 12...1). If it breaks, test the floors below one at a time with the second egg. This guarantees the answer in at most 14 drops.", "依次在14、27、39、50、60、69、77、84、90、95、99、100层扔（间隔14,13,12...1，逐次减1）。一旦碎了，用第二个鸡蛋从上次没碎的楼层开始一层层试。这样最多14次一定能找到答案。"],
    "m1-14": ["Split into 4/4/4 and weigh two groups first — think carefully about what balance vs imbalance tells you when the direction is unknown.", "分成4、4、4三堆，先称两堆——想清楚平衡和不平衡分别透露了什么。", "This is the classic 12-coin puzzle — full solution: Weigh {1,2,3,4} vs {5,6,7,8}. If BALANCED, the fake is among {9,10,11,12} (1-8 are genuine). Weigh {9,10,11} vs 3 genuine coins: balanced means 12 is fake (weigh it against a genuine coin to learn heavy or light); one side heavier means the fake is in that trio and heavy (weigh 9 vs 10 — balanced means 11 is fake, otherwise the heavier one is); one side lighter works the same way but the fake is light. If {1,2,3,4} is HEAVIER, the fake is either a heavy coin among 1-4 or a light coin among 5-8 (9-12 are genuine). Weigh {1,2,5} vs {3,4,6}: balanced means the fake is 7 or 8 (light) — weigh 7 vs 8, the lighter one is fake; {1,2,5} heavier means the fake is 1, 2 (heavy) or 6 (light) — weigh 1 vs 2: balanced means 6 is fake (light), otherwise the heavier of the two is fake; {1,2,5} lighter means the fake is 3, 4 (heavy) or 5 (light) — weigh 3 vs 4: balanced means 5 is fake (light), otherwise the heavier of the two is fake. If {5,6,7,8} was heavier in the first weighing, just mirror this whole method with the two groups swapped.", "这是经典的12枚硬币问题，完整解法：先称{1,2,3,4} vs {5,6,7,8}。如果平衡，假币在{9,10,11,12}里（1-8都是真的）。再称{9,10,11} vs 3枚真币：平衡则12是假币（跟真币再称一次判断轻重）；如果变重，假币在这3个里且偏重（称9 vs 10：平衡说明是11，否则较重的那个就是）；如果变轻，思路一样但假币偏轻。如果第一次称{1,2,3,4}更重，说明假币要么是1-4里偏重的一个，要么是5-8里偏轻的一个（9-12都是真的）。称{1,2,5} vs {3,4,6}：平衡则假币是7或8（偏轻）——再称7 vs 8，轻的那个是假币；如果{1,2,5}更重，假币是1、2（偏重）或6（偏轻）——称1 vs 2：平衡说明6是假币（偏轻），否则较重的那个就是假币；如果{1,2,5}更轻，假币是3、4（偏重）或5（偏轻）——称3 vs 4：平衡说明5是假币（偏轻），否则较重的那个是假币。如果第一次是{5,6,7,8}更重，把两组角色互换，用同样方法就行。"],
    "m1-15": ["The reference coin lets you use one weighing purely to confirm direction, instead of always narrowing down suspects.", "有了标准币，你可以专门用它来验证方向，而不必每次称重都拿来缩小嫌疑范围。", "Without a reference coin, 3 weighings handle at most 12 coins, because every weighing has to help with BOTH finding which coin is fake AND whether it's heavy or light. A genuine reference coin can be swapped in purely to test direction, unlocking one extra coin's worth of capacity, extending the limit from 12 to 13.", "没有标准币时，3次称重最多测12枚，因为每次结果既要帮你缩小是谁的范围，又要判断轻还是重。有1枚真币，可以专门用它来验证方向，相当于多解锁1枚硬币的检测能力，上限从12变成13。"],
    "m1-16": ["Take a DIFFERENT number of pills from each barrel — the total weight's shortfall will point to the answer.", "从每桶拿不同数量的药丸——总重量缺了多少就能告诉你答案。", "Take 1 pill from barrel 1, 2 from barrel 2, ... 10 from barrel 10 (55 pills total). If all were genuine (10g each) the total would be 550g. The shortfall in grams equals the number of the bad barrel, since barrel k contributes k pills each 1g light.", "从第1桶拿1粒，第2桶拿2粒……第10桶拿10粒（共55粒）。如果都是真的（每粒10克），总重该是550克。实际少了多少克，就是第几桶假（第k桶贡献k粒，每粒轻1克）。"],
    "m1-17": ["Each extra weighing multiplies your search power by about 3 — follow the pattern from 2 weighings to 3 balls, and 3 weighings to 12 balls.", "每多称一次，能查的范围大约乘以3——按2次→3个、3次→12个的规律推算。", "The pattern is (3^k - 3)/2 for k weighings with no reference coin. For k=4: (81-3)/2 = 39 balls.", "规律是(3^k-3)/2（k是称重次数，没有标准币）。k=4时：(81-3)/2=39个球。"],
    "m2-01": ["Each person shakes hands with 7 others, but multiplying that directly counts every handshake twice.", "每人和7个人握手，但直接乘会把每次握手算两遍。", "8x7=56, then divide by 2 since every handshake got counted twice, giving 28.", "8×7=56，因为每次握手被算了两遍，除以2＝28次。"],
    "m2-02": ["From each corner, how many OTHER corners can it connect to without drawing a side of the hexagon?", "从一个顶点出发，除了两个相邻顶点（那是边），还能连几个顶点？", "Each vertex connects to 3 non-adjacent vertices (6 minus itself minus its 2 neighbors). 6x3=18, divide by 2 for double-counting, giving 9 diagonals.", "每个顶点能连3个不相邻的顶点。6×3=18，除以2（每条对角线算了两次）＝9条。"],
    "m2-03": ["Count each size separately: how many 1x1 squares? 2x2? 3x3? 4x4?", "分开数：1x1有几个？2x2？3x3？4x4呢？", "1x1: 16, 2x2: 9, 3x3: 4, 4x4: 1. Total = 16+9+4+1 = 30.", "1x1有16个，2x2有9个，3x3有4个，4x4有1个，加起来30个。"],
    "m2-04": ["At every dot, the number of ways to reach it equals the ways to reach the dot above plus the dot to the left.", "每个点的走法数，等于它上面那点的走法数加上左边那点的走法数。", "This is Pascal's triangle laid on a grid. The answer is C(6,3) = 20, since you need exactly 3 rights and 3 downs in any order.", "这其实是杨辉三角铺在网格上。答案是C(6,3)=20（一共走3次右、3次下，顺序随便排）。"],
    "m2-05": ["Imagine the 10 candies in a row with 2 dividers mixed in, marking where one kid's share ends and the next begins.", "想象10颗糖排一排，再放2根分隔棒把它们分成3份。", "This is the classic 'stars and bars' method: C(10+2,2) = C(12,2) = 66 ways.", "这是经典的隔板法：C(12,2)=66种分法。"],
    "m2-06": ["Each new cut can cross all the previous cuts — how many new pieces does crossing every old cut create?", "每加一刀都能和之前所有刀相交——每多一个交点就多切出1块。", "Pieces = 1 + n(n+1)/2. So 3 cuts give 7 pieces, and 4 cuts give 11 pieces (each new cut adds as many new pieces as the cuts it crosses, plus 1).", "块数＝1+n(n+1)/2。3刀最多7块，4刀最多11块（每刀新增的块数＝它和之前刀相交的次数+1）。"],
    "m2-07": ["How many choices for the first spot? Then the second, once one person is placed?", "第一个位置有几种选择？放好一人后第二个位置呢？", "5x4x3x2x1 = 120, which is 5 factorial.", "5×4×3×2×1=120（5的阶乘）。"],
    "m2-08": ["5 choices for the first digit, then how many are left for the second?", "第一位5种选择，选完第二位还剩几种？", "5x4x3 = 60.", "5×4×3=60个。"],
    "m2-09": ["List every pair of rolls that add up to 7.", "把所有加起来等于7的两次点数组合列出来。", "(1,6),(2,5),(3,4),(4,3),(5,2),(6,1), which is 6 combinations.", "(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)，一共6种。"],
    "m2-10": ["Start from the total in the first handshake puzzle, then just subtract the handshakes that don't happen.", "从第一题的握手总数开始，直接减掉不会发生的那几次。", "28 (from before) minus 2, since the two couples each skip one handshake, giving 26.", "28（上一题答案）－2（两对夫妻各少1次）＝26次。"],
    "m2-11": ["Total segments = C(8,2) = 28. Now sort them into 3 types by how they run through the cube.", "总共C(8,2)=28条线段，再按怎么穿过正方体分成3类。", "Edges (length 1): 12. Face diagonals (length root2): 12. Space diagonals through the center (length root3): 4. Total 12+12+4=28.", "棱（长度1）：12条。面对角线（长度√2）：12条。体对角线（穿过中心，长度√3）：4条。加起来28条，正好对上。"],
    "m2-12": ["Same method as the 4x4 grid, just add one more size.", "跟4x4网格一样的算法，只是多算一种尺寸。", "25+16+9+4+1 = 55.", "25+16+9+4+1=55个。"],
    "m2-13": ["The first digit can't be 0 — handle that restriction first, then count the rest normally.", "第一位不能是0——先单独处理这个限制，剩下正常数。", "First digit: 9 choices (1-9). The remaining 3 digits, chosen in order from the 9 leftover digits (0 is allowed now): 9x8x7. Total = 9x9x8x7 = 4536.", "第一位9种选择（1-9）。剩下3位从剩下的9个数字（这时0可以用了）按顺序选：9×8×7。总共9×9×8×7=4536个。"],
    "m2-14": ["Order doesn't matter here, unlike the photo lineup problem.", "这里顺序不重要——跟排队拍照那题不一样。", "C(30,3) = 30x29x28 / (3x2x1) = 4060.", "C(30,3)=30×29×28÷(3×2×1)=4060种。"],
    "m2-15": ["Diagonals: subtract the sides from all possible connections. Intersections: every group of 4 corners makes exactly 1 crossing point inside.", "对角线：从所有连线减去边。交点：任选4个顶点正好围出1个交点。", "Diagonals: C(10,2) minus 10 sides = 45-10 = 35. Max intersections: C(10,4) = 210, since every 4 vertices' two diagonals cross exactly once.", "对角线：C(10,2)减10条边＝45-10=35条。最多交点：C(10,4)=210（任选4个顶点，它们的对角线正好交于1点）。"],
    "m2-16": ["Fix one person's seat to avoid double-counting rotations as different arrangements.", "固定1个人的座位，避免把转一圈算成不同的排法。", "(5-1)! = 4! = 24.", "(5-1)!=4!=24种。"],
    "m3-01": ["Try assuming he's a truth-teller, does the statement hold up? Now try assuming he's a liar.", "先假设他是诚实人，这句话说得通吗？再假设他是说谎者试试。", "It's a paradox, impossible either way. If honest, saying 'I am a liar' would be a lie, a contradiction. If a liar, the statement would have to be true, also a contradiction. This is a version of the classic Liar Paradox.", "这是个悖论，两种假设都说不通。如果他是诚实人，说这句话就是撒谎，矛盾；如果是说谎者，这句话就该是真的，也矛盾。这是经典的说谎者悖论。"],
    "m3-02": ["Ask a question that forces both guards to point to the SAME, wrong door.", "问一个能让两个守卫都指向同一扇（错误）门的问题。", "Ask either guard: what would the other guard say is the safe door? Both guards, honest or not, will point to the dangerous door, so choose the opposite one.", "随便问一个守卫：如果问另一个守卫，他会说哪扇门安全？不管问的是谁，两人的答案都会指向危险门，选另一扇就对了。"],
    "m3-03": ["Think about what it would mean if the back person had seen two white hats.", "想想如果最后面的人看到前面都是白帽子，会怎样。", "There are only 2 white hats total, so if the back person saw white+white, he'd instantly know his own is red. He couldn't tell, so not both front two are white. The middle person, hearing this, knows at least one of the front two is red. If the front hat were white, the middle person could deduce their own is red, but they couldn't either, so the front hat must be red.", "一共只有2顶白帽子，如果最后面的人看到前两人都白，他立刻能猜出自己是红的。他猜不出，说明前两人不可能都白。中间的人听懂后知道自己和最前面至少一人是红的。如果最前面是白色，中间的人就能推出自己是红的，但他也猜不出，所以最前面一定是红色。"],
    "m3-04": ["Figure out who CAN'T possibly be the tallest first, by elimination.", "先用排除法想：谁不可能是最高的？", "D is shortest. B<A<C, so neither B nor A can be tallest. E>A but isn't tallest (given), so C must be tallest. Full order shortest to tallest: D, B, A, E, C.", "丁最矮。乙<甲<丙，所以甲乙都不可能最高。戊>甲但戊不是最高，所以丙一定最高。完整顺序（矮到高）：丁、乙、甲、戊、丙。"],
    "m3-05": ["Think about what's different about him physically, and what rain lets him carry.", "想想他身体上有什么特别之处，下雨天他手里会多一样什么东西？", "He's very short and can only reach the button for the 7th floor by hand. On rainy days he carries an umbrella and uses its tip to press the higher button.", "他个子很矮，平时手只够得到7楼的按钮。下雨天他带着雨伞，能用伞尖去按更高的按钮。"],
    "m3-06": ["Clue 2 forces where the green house must be — think about what immediately right requires to even be possible.", "线索②决定了绿房子只能在哪——想想紧挨右边要成立，绿房子不能在最右边。", "Red=house1 (clue1). Green can't be house3 (nothing to its right), so Green=house2, Blue=house3, and the dog owner (immediately right of green) is house3 (blue). Clue3 says the green owner isn't cat, so green=bird, leaving red=cat. Final: Red-cat, Green-bird, Blue-dog.", "红=1号。绿房子不能在3号（右边没房子了），所以绿=2号，蓝=3号，养狗的（紧挨绿房子右边）就是3号蓝房子。线索③说绿房子不养猫，所以绿=鸟，剩下红=猫。答案：红-猫，绿-鸟，蓝-狗。"],
    "m3-07": ["B's and A's statements are about the same fact, whether B is first — what happens if both are lying, or both telling the truth?", "乙和甲的话都在说同一件事（乙是不是第一）——想想如果两人都说谎或都说真话会怎样。", "Test each person as the liar: if A lies, B and C must both be true, but B says I am first and C says A is first, contradiction. If C lies, A and B true means B is first and not first at once, contradiction. Only B lying works: A is true (B not first), C is true (A is first). So A is first.", "逐个假设谁说谎：如果甲说谎，乙丙都要真，但乙说我是第一、丙说甲是第一，矛盾。如果丙说谎，甲乙都真，则乙是第一又跟甲的真话矛盾。只有乙说谎说得通：甲的话真（乙不是第一），丙的话真（甲是第一）。所以甲是第一名。"],
    "m3-08": ["Same idea as the fruit boxes puzzle — draw from the box labeled one of each.", "跟水果盒子那题思路一样——从贴着一红一蓝标签的盒子摸。", "Draw from the box labeled one red one blue (this label must be wrong, so it's actually all-red or all-blue). Say you draw red, that box is all-red. The box labeled blue-blue can't be blue-blue and can't be all-red, so it must be one of each. The last box is all-blue.", "从贴着一红一蓝标签的盒子摸一个（这标签一定错，所以它其实是全红或全蓝）。假设摸出红球，这盒就是全红。贴着蓝蓝标签的盒子不可能是蓝蓝也不可能是全红，所以它是一红一蓝，剩下那盒全蓝。"],
    "m3-09": ["It's not a solid object — think about something you use TO wash things.", "不是固体的东西——想想你是用什么去洗别的东西的。", "Water. The more you use it to wash things, the dirtier the water itself gets.", "答案是水——用水洗的东西越多，水本身就越脏。"],
    "m3-10": ["Start with the first clue — it rules out any month that has a day appearing only once in the whole list.", "先看第一句话——它排除了那些日期在整个列表里独一无二的月份。", "The first clue rules out May and June (May19 and June18 have unique days). That leaves July14/16 and Aug14/15/17. The second clue then rules out day 14 (still ambiguous between two months). That leaves July16, Aug15, Aug17. The third clue rules out August (still two options). Answer: July 16.", "第一句话排除了5月和6月（因为5月19日、6月18日的日期独一无二）。剩下7月14、16和8月14、15、17。第二句话排除了14号（还对应两个月份）。剩下7月16、8月15、17。第三句话排除了8月（还剩两个选项）。答案：7月16日。"],
    "m3-11": ["Try assuming each person is guilty, one at a time, and count how many statements turn out true each time.", "依次假设每人是凶手，数一数每种假设下有几句话是真的。", "Testing each: if A is guilty, 2 statements are true (too many). If B, 3 are true. If D, 2 are true. Only if C is guilty is exactly 1 statement (D's) true. So C is the culprit.", "逐一测试：假设甲是凶手会有2句真的。假设乙，3句真的。假设丁，2句真的。只有假设丙是凶手时恰好1句（丁说的）是真的。所以丙是凶手。"],
    "m3-12": ["Clues 1-3 pin down the nationality order completely before you even think about pets.", "先用线索①②③把国籍顺序完全确定，再想宠物。", "American=1, French=4 (clues 1,2). Clue3 forces Japan=2, China=3. Pets: American=dog (clue4), Chinese=fish (clue5). Japanese isn't cat (clue6), so Japanese=bird, leaving French=cat. The Chinese person keeps the fish, the French person keeps the cat.", "美国=1号，法国=4号。线索③要求中国紧挨日本右边，只能是日本=2号、中国=3号。美国养狗，中国养鱼。日本不养猫，所以日本养鸟，剩下法国养猫。养鱼的是中国人，养猫的是法国人。"],
    "m3-13": ["Break 180 into 5 factors, none bigger than 10 — start from the prime factorization 180 = 2x2x3x3x5.", "把180拆成5个因数，每个不超过10——可以从质因数分解180=2×2×3×3×5入手。", "Several sets work, e.g. 1,4,5,3,3 or 2,2,5,3,3 or 1,2,2,5,9 or 1,1,4,5,9 or 1,1,2,9,10. Since more than one combination fits, the product alone can't tell you which is correct, you'd need another clue, like the classic 'two children's ages' puzzle.", "有好几组都符合，比如1,4,5,3,3、2,2,5,3,3、1,2,2,5,9、1,1,4,5,9、1,1,2,9,10。因为不止一组符合，光靠乘积没法确定是哪组，需要再加一条线索才能锁定，这跟经典的两个孩子年龄谜题是同一个套路。"],
    "m3-14": ["A light ends up on only if its number gets toggled an odd number of times, and it gets toggled once per divisor of its number.", "一盏灯最后亮着，前提是它被按了奇数次——次数正好等于它的编号有多少个因数。", "Light n is toggled once per divisor of n. Most numbers have divisors in pairs, giving an even count, except perfect squares, whose square-root divisor pairs with itself, giving an odd count. So exactly the perfect-square-numbered lights (1,4,9...100, 10 of them) stay on.", "第n盏灯被按的次数＝n有多少个因数。大多数数字的因数成对出现，次数是偶数，只有完全平方数的因数会多出一个跟自己配对的，次数是奇数。所以最后只有编号是完全平方数的灯亮着（1,4,9...100，共10盏）。"],
    "m3-15": ["Start from the two most absolute clues (Norwegian in house1, milk in house3) and work outward step by step.", "先从两条最绝对的线索入手（挪威人住1号，喝牛奶的住3号），再一步步往外推。", "This is the famous Einstein's Riddle. Working through all 15 clues gives one unique solution — House1: Norway, yellow, water, Dunhill, cats. House2: Denmark, blue, tea, Blend, horses. House3: England, red, milk, Pall Mall, birds. House4: Germany, green, coffee, Prince, FISH. House5: Sweden, white, beer, Blue Master, dogs. So the German in house 4 owns the fish. Key steps: clue 9 fixes Norway=house1; clue 14 then forces blue=house2 (Norway's only neighbor); clue 4 (green immediately left of white) only fits houses 4-5, so green=house4, white=house5; clue 8 fixes milk=house3, and clue 5 (green house drinks coffee) then leaves water for house1 and beer for house5; the remaining clues (1,2,3,6,7,10,11,12,13,15) pin down every other cell, and the fish always lands on the German in house4.", "这是著名的爱因斯坦谜题。把全部15条线索推演完，答案唯一——1号房：挪威、黄色、水、Dunhill烟、猫。2号房：丹麦、蓝色、茶、Blend烟、马。3号房：英国、红色、牛奶、Pall Mall烟、鸟。4号房：德国、绿色、咖啡、Prince烟、鱼。5号房：瑞典、白色、啤酒、Blue Master烟、狗。所以养鱼的是4号房的德国人。关键推理：线索⑨定挪威=1号；线索⑭因此逼出蓝色=2号（挪威唯一的邻居）；线索④（绿房子紧挨白房子左边）只有4-5号能满足，所以绿=4号、白=5号；线索⑧定牛奶=3号，再结合线索⑤（绿房子喝咖啡）推出水只能是1号、啤酒是5号；剩下的线索（①②③⑥⑦⑩⑪⑫⑬⑮）依次唯一确定其余格子，鱼最终都落在4号房的德国人这里。"],
    "m3-16": ["The very back person can sacrifice their own guess to send everyone else a coded message.", "最后面的人可以牺牲自己的猜测，把信息编码传给前面所有人。", "The back person says white if the count of white hats they see is even, black if odd (a coded signal). Everyone after that figures out their own color by tracking the running parity from all the answers so far. This guarantees 99 correct guesses.", "最后面的人数一数看到的白帽子，偶数就喊白，奇数就喊黑（这是给别人的信号）。后面每个人都能根据前面所有回答推算出自己的颜色。这样能保证99人猜对。"],
    "m3-17": ["Ask a question so convoluted that it doesn't matter whether the god you're asking lies — build a question about what ANOTHER god would say.", "问一个足够绕的问题，让你问的神说不说谎都无所谓——问的是另一个神会怎么回答。", "This is Boolos' Hardest Logic Puzzle Ever. The key trick: for any yes/no question Q, asking a god 'If I asked you Q, would you say ja?' always gets an answer that reveals Q's TRUE answer — ja if Q is really true, da if false — and this works whether you ask the True god or the False god (their two flips cancel out); only Random stays unpredictable. Full strategy: Q1, ask god A: 'If I asked you \"Is B Random?\", would you say ja?' — however A answers, this always identifies one specific god (B or C) guaranteed NOT Random; call them Safe. Q2, ask Safe: 'If I asked you \"Are you True?\", would you say ja?' — a ja-equivalent answer means Safe really is the True god (done!); a da-equivalent answer means Safe is the False god. Q3 (only needed if Safe turned out False): ask Safe 'If I asked you \"Is [one of the other two] True?\", would you say ja?' to identify the last two. That embedded-question trick is the one idea that unlocks the whole puzzle — the full case-by-case reasoning is genuinely intricate, well worth working through with a parent or teacher.", "这是逻辑学家Boolos提出的史上最难逻辑题。核心诀窍：对任何是非问题Q，问一个神\"如果我问你Q，你会说ja吗？\"——这个问题的答案永远会透露Q的真实答案：Q为真答\"ja\"，为假答\"da\"，而且不管问的是真神还是假神都成立（两次反转刚好抵消），只有随机神无法预测。完整3问策略：第1问，问神A：\"如果我问你'B是随机神吗'，你会说ja吗？\"不管A怎么回答，都能确定另一个神（B或C其中之一）一定不是随机神——记为\"安全神\"。第2问，问安全神：\"如果我问你'你是真神吗'，你会说ja吗？\"——答案等价于\"ja\"说明安全神真的是真神（完成！）；等价于\"da\"说明安全神是假神。第3问（只有安全神是假神时才需要）：问安全神\"如果我问你'剩下两个神里的某一个是真神吗'，你会说ja吗？\"，就能确定最后两个神的身份。这个\"嵌套提问\"的诀窍就是解开整题的关键——完整的逐种情况推理确实很绕，值得和家长或老师一起讨论。"],
    "m4-01": ["The lines are allowed to go OUTSIDE the square formed by the dots, don't box yourself in.", "直线可以画到9个点围成的正方形范围之外——别把自己框住了。", "Start from a corner dot and draw a zigzag that overshoots the grid boundary each time, letting the lines extend past the 3x3 square rather than staying inside it. That extra room outside the dots is the key trick.", "从边角出发，画出会超出点阵范围的折线，让直线延伸到3x3边界之外，而不是困在里面。点阵外面的这块空间就是解题关键。"],
    "m4-02": ["The rectangle is exactly twice as long as it is wide, where's the halfway point?", "长方形的长正好是宽的2倍——它的一半在哪？", "Fold it in half along the short direction, bringing the two short ends together. Since the length is exactly double the width, this fold produces a perfect square.", "沿短边方向对折（把两条短边对齐），因为长正好是宽的2倍，这样一折就正好是正方形。"],
    "m4-03": ["Don't forget the hour hand has already moved a quarter of the way from 3 to 4 by 3:15.", "别忘了3点15分时，时针已经从3走到4的四分之一路程了。", "The minute hand is at 90 degrees. The hour hand has moved 1/4 of the way from 3 to 4, which is 7.5 degrees past the 3 mark, so it's at 97.5 degrees. The angle between them is 7.5 degrees.", "分针指向90°。时针从3走到4已经走了1/4，也就是超过3那个位置7.5°，所以在97.5°。两者夹角＝7.5°。"],
    "m4-04": ["The minute hand and hour hand don't overlap exactly every hour, think about how much faster the minute hand moves.", "分针和时针不是每小时都重合——想想分针比时针快多少。", "In 12 hours the minute hand makes 12 laps while the hour hand makes 1, so the minute hand laps the hour hand 11 times, meaning they overlap 11 times.", "12小时内分针转12圈，时针只转1圈，分针多转11圈，也就是重合11次。"],
    "m4-05": ["Moving one matchstick can change a whole digit's shape, think about which single move turns 6 into another digit.", "移动1根火柴能改变整个数字的形状——想想哪一步能把6变成别的数字。", "Move the middle stick of the 6 to its top-right, turning it into a 0. The equation becomes 0+4=4, which is correct.", "把6中间那根火柴移到右上角，6就变成0。等式变成0+4=4，成立。"],
    "m4-06": ["Try drawing every arrangement of 6 connected squares that could fold into a cube, many look different but are just rotations of each other.", "试着画出所有能折成正方体的6连方组合——有些看起来不同其实只是转了方向。", "There are exactly 11 distinct nets (unfoldings) of a cube.", "正方体一共有11种不同的展开图。"],
    "m4-07": ["Think about the checkerboard's black and white squares, what color are the two opposite corners?", "想想棋盘的黑白格——两个相对的角是同一颜色吗？", "It's impossible. Opposite corners are always the same color. Removing 2 same-colored squares leaves 32 of one color and 30 of the other, but every domino must cover exactly 1 black and 1 white, so the colors can never match up.", "不可能。相对的角颜色相同。去掉2个同色格子后剩32格一色、30格另一色，但每张骨牌必须盖1黑1白，数量对不上，无法铺满。"],
    "m4-08": ["Try it move by move on a real board, the knight needs to cover distance and zigzag at the same time.", "在真棋盘上一步步试试——骑士既要走远又要之字形绕。", "6 moves.", "最少6步。"],
    "m4-09": ["Unfold the box flat on paper, walking across a surface turns into a straight line once unfolded.", "把房间在纸上展开——沿着表面爬的路径展开后就变成直线。", "Unfold one end wall, the floor, and the other end wall into a flat strip: 6 (down to floor) + 30 (across) + 6 (up to the far wall's center) = 42cm.", "把一面端墙+地板+另一面端墙展开成直的纸带：6（下到地板）+30（穿过地板）+6（爬到对面墙中心）＝42厘米。"],
    "m4-10": ["A single straight cut through any shape can only ever do one thing, think about why more than 2 pieces isn't possible.", "1刀直线切任何形状只能做一件事——想想为什么不可能超过2块。", "Without folding, 1 straight cut always gives exactly 2 pieces, since a line can only cross the shape's boundary twice. Fold the paper in half first, then 1 straight cut through both layers can give up to 3 pieces once unfolded.", "不折叠时1刀直线永远切出2块（直线最多穿过边界2次）。先对折再剪1刀穿过两层，打开后最多能变成3块。"],
    "m4-11": ["Each new line can cross every line drawn before it, every crossing adds one more region.", "每新加一条线都能和之前所有线相交——每多一个交点就多出一块区域。", "Regions = 1 + n(n+1)/2. For 4 lines: 1+4+6 = 11.", "区域数＝1+n(n+1)/2。4条直线：1+4+6=11块。"],
    "m4-12": ["Tilt the cutting plane so it slices through all 6 faces instead of just 4.", "把切面斜着放，让它切到全部6个面而不只是4个。", "A hexagon, 6 sides, achieved by slicing at an angle that cuts through all 6 faces of the cube.", "六边形（6条边）——切面斜着切过全部6个面就能得到。"],
    "m4-13": ["Corner cubes touch 3 faces, edge cubes touch 2, face-center cubes touch 1, and the very middle cube touches none.", "角上的小方块碰到3个面，棱上的碰到2个，面中心的碰到1个，正中间那块一个都碰不到。", "3-face (corners): 8. 2-face (edges): 12. 1-face (face centers): 6. 0-face (the very center): 1. Total 8+12+6+1=27.", "三面涂色（角块）8个，两面（棱块）12个，一面（面中心）6个，没涂色（正中心）1个，加起来27正好对上。"],
    "m4-14": ["The hour hand moves smoothly and continuously, does it ever point the exact same direction at two different times within 12 hours?", "时针连续平滑移动——12小时内它会在两个不同时刻指向完全相同的方向吗？", "In principle, yes it can be read exactly: the hour hand moves 0.5 degrees per minute, so every distinct minute has a distinct angle within a 12-hour span. The real challenge is that the human eye can't measure such tiny angle differences.", "理论上可以：时针每分钟移动0.5°，12小时内每分钟对应的角度都不同。实际难点是人眼很难分辨这么细微的角度差异。"],
    "m4-15": ["Each fold doubles the number of layers, but the paper also gets smaller and thicker each time, that's the real limit.", "每折一次层数翻倍——但纸也会变小变厚，这才是真正的限制。", "Layers = 2^n (128 after 7 folds). In real life you rarely fold ordinary paper more than 7-8 times, because each fold both doubles the thickness and uses up length, so it quickly becomes too small and stiff to fold again, a real, measured physical limit.", "层数＝2的n次方（折7次是128层）。现实中很难折超过7-8次，因为每折一次纸既变厚又变短，很快就又小又硬折不动了，这是真实测量过的物理极限。"],
    "m4-16": ["A torus (donut shape) has a hole that a flat map doesn't, that extra structure allows more mutual neighbors.", "甜甜圈（环面）比平面多了一个洞——这让更多区域能互相相邻。", "7 colors, compared to only 4 needed for any flat map (the Four Color Theorem). This is the Heawood conjecture/theorem for the torus.", "7种颜色（平面地图只需要4种，就是四色定理）。这是环面版本的希伍德定理。"],
    "m4-17": ["Unfold two faces of the cube flat, like opening a book, the shortest path becomes a straight diagonal line.", "把正方体两个面像翻书一样摊平——最短路径就变成一条直线。", "Unfold two adjacent faces into a 1x2 flat rectangle. The straight-line distance across it is the square root of 5 (about 2.24), shorter than any path that only follows the edges.", "把两个相邻面摊平成1×2的长方形，对角线长度是根号5（约2.24），比只沿棱爬的路径更短。"],
    "m5-01": ["Try multiplying all four numbers together first.", "先试试把4个数字直接乘起来。", "1x2x3x4=24 is the simplest. Another way: (1+3)x(2+4)=24.", "最简单的是1×2×3×4=24。另一种：(1+3)×(2+4)=24。"],
    "m5-02": ["Write it as an algebra expression with x for the mystery number and simplify step by step.", "把每一步写成含x的代数式，一步步化简看看。", "(2x+6)/2 - x = (x+3) - x = 3, no matter what x is.", "(2x+6)÷2－x=(x+3)－x=3，不管x是多少都一样。"],
    "m5-03": ["The magic sum for numbers 1-9 is always 15, put 5 in the very center first.", "1-9填出的幻方每行每列和一定是15——先把5放正中间。", "One solution: top row 2,7,6; middle row 9,5,1; bottom row 4,3,8. Every row, column, and diagonal sums to 15.", "一种填法：上行2,7,6；中行9,5,1；下行4,3,8。每行每列和对角线都是15。"],
    "m5-04": ["Look at the differences between consecutive terms (4,6,8,10), what pattern do those differences follow?", "看相邻两项的差（4,6,8,10）——这些差本身有规律吗？", "The formula is n(n+1): 1x2=2, 2x3=6, 3x4=12... so the next two terms are 6x7=42 and 7x8=56.", "通项公式是n(n+1)：1×2=2、2×3=6……接下来两项是6×7=42和7×8=56。"],
    "m5-05": ["Since TWO+TWO=FOUR, that's 2xTWO=FOUR, and FOUR has 4 digits while TWO only has 3, so a carry must be happening.", "既然TWO+TWO=FOUR，也就是2×TWO=FOUR，FOUR是4位而TWO只有3位，说明乘出来一定进位了。", "One valid solution: T=7, W=3, O=4, F=1, U=6, R=8, giving 734+734=1468.", "一种答案：T=7，W=3，O=4，F=1，U=6，R=8，也就是734+734=1468。"],
    "m5-06": ["A number that's a multiple of both 3 and 4 is just a multiple of 12.", "同时是3和4的倍数，其实就是12的倍数。", "12,24,36,48,60,72,84,96, which is 8 numbers.", "12、24、36、48、60、72、84、96，一共8个。"],
    "m5-07": ["A number and its digit sum leave the same remainder when divided by 9, what does that mean for two numbers made of the same digits?", "一个数除以9的余数跟它数字和除以9的余数一样——那用相同数字组成的两个数呢？", "Yes, always. Rearranging digits doesn't change the digit sum, so both numbers give the same remainder mod 9, meaning their difference is always a multiple of 9.", "永远都是。重新排列数字不改变数字和，两个数除以9的余数一样，它们的差自然是9的倍数。"],
    "m5-08": ["A 3-digit palindrome looks like aba, how many choices for a and how many for b?", "3位回文数长得像aba——a有几种选择，b有几种？", "'a' (first and last digit, same) has 9 choices (1-9), 'b' (middle) has 10 choices (0-9), so 9x10=90.", "a（首尾相同）有9种选择（1-9），b（中间）有10种（0-9），9×10=90个。"],
    "m5-09": ["Try it with a real example first, like 532, and see what happens before thinking about why.", "先拿一个真实例子试试，比如532，看看会发生什么再想为什么。", "Try 532: reverse=235, 532-235=297, reverse of 297=792, 297+792=1089. It always works because digit reversal always produces a multiple of 99 with a specific pattern, and adding its reverse collapses to 1089.", "试试532：倒过来是235，532-235=297，297倒过来是792，297+792=1089。之所以永远成立，是因为倒序相减总产生特定规律的99倍数，再加倒序结果总归到1089。"],
    "m5-10": ["List every number that divides evenly into 28, except 28 itself, and add them up.", "列出能整除28的所有数字（除了自己），加起来看看。", "Divisors of 28 excluding itself: 1,2,4,7,14. Sum = 1+2+4+7+14 = 28.", "28的因数（不含自己）：1、2、4、7、14，加起来正好是28。"],
    "m5-11": ["Divide each Fibonacci number by the one before it, and watch what happens as the numbers get bigger.", "用每个斐波那契数除以前一个数，看数字变大后结果如何变化。", "It approaches the golden ratio, about 1.618.", "会越来越接近黄金比例，约1.618。"],
    "m5-12": ["Count multiples of 3, count numbers containing digit 3, then don't double-count the ones that are both.", "先数3的倍数，再数含数字3的数，注意别把两者都满足的重复数了。", "Multiples of 3 up to 50: 16 numbers. Numbers containing digit 3: 14 numbers. Numbers that are both: 5. Total = 16+14-5 = 25.", "1-50里3的倍数16个，含数字3的数14个，两者都满足的5个，总数＝16+14-5=25个。"],
    "m5-13": ["Trailing zeros come from factors of 2x5, and there are way more 2s than 5s, so just count how many 5s are hiding in 1x2x...x100.", "末尾的0来自2×5，1到100里2的因子远比5多——数一数藏了多少个5就行。", "Count multiples of 5 (20), plus extra 5s from multiples of 25 (4 more). 20+4=24 trailing zeros.", "数5的倍数(20个)，再加25的倍数额外多贡献的(4个)，20+4=24个末尾0。"],
    "m5-14": ["Think about 101 factorial plus a small number, what does adding 2 through 101 give you?", "想想101!加上一个小数字——加上2到101分别会怎样？", "Yes: 101!+2, 101!+3, ... 101!+101 are 100 consecutive numbers, and each one is divisible by k (its offset), so none are prime.", "可以：101!+2到101!+101这100个连续数，每一个都能被对应的k整除，所以全都不是质数。"],
    "m5-15": ["For the biggest difference, put the 5 largest digits in the first number and the 5 smallest in the second, but the second can't start with 0.", "要差最大，把5个最大数字放第一个数，最小的放第二个数（注意第二个不能以0开头）。", "Max difference: 98765 - 10234 = 88531 (biggest 5 digits descending, minus the smallest 5 digits with no leading zero). Minimum difference: 247, for example 50123 - 49876 = 247 — the trick is making the leading digits differ by just 1 (4 and 5 here), then giving the larger-leader number the smallest remaining digits and the smaller-leader number the largest remaining digits, so the gap closes as fast as possible.", "最大差：98765-10234=88531（5个最大数字从大到小排成一个数，5个最小数字排成不含前导0的最小数）。最小差：247，比如50123-49876=247——诀窍是让两个数的首位只差1（这里是4和5），首位较大的那个数配上剩下数字里最小的几个，首位较小的那个数配上剩下数字里最大的几个，这样差距能尽快被追平。"],
    "m5-16": ["Pick a number, square each digit and add them up, repeat, and track whether you land on 1 or the loop.", "挑一个数，把每位数字平方相加，重复这个过程，看是停在1还是进入循环。", "Under 100, the happy numbers are: 1,7,10,13,19,23,28,31,32,44,49,68,70,79,82,86,91,94,97, which is 19 numbers.", "100以内的快乐数：1、7、10、13、19、23、28、31、32、44、49、68、70、79、82、86、91、94、97，共19个。"],
    "m6-01": ["Think about what you can safely bring back WITH you on a return trip.", "想想回程时可以顺便带什么东西回来。", "Take the sheep across first. Go back alone, bring the wolf across, but bring the sheep back with you. Leave the sheep, take the cabbage across. Go back alone, bring the sheep across.", "先带羊过河。空手回来，带狼过河，但把羊带回来。留下羊，带白菜过河。空手回来，最后带羊过河。"],
    "m6-02": ["What total do you want to always leave for your opponent after each of your turns?", "你希望每次拿完后，给对方留下的总数是多少？", "Always leave a multiple of 4. Take 1 first (leaving 20), then take (4 minus whatever they took) each turn to keep leaving multiples of 4.", "每次拿完都给对方留4的倍数。先拿1颗留20，之后每次拿(4减对方拿的数量)，保持留给对方的是4的倍数。"],
    "m6-03": ["Think about it from the cutter's point of view, what's their best strategy knowing they don't get to choose?", "站在切的人角度想——既然不能自己选，他最聪明的切法是什么？", "The cutter, knowing they get whichever piece is left, has every incentive to cut as evenly as possible, so no matter which piece the chooser picks, neither person can complain.", "切的人知道自己只能拿剩下那块，所以一定尽量切均匀。这样不管对方选哪块，两人都不能抱怨。"],
    "m6-04": ["The number of round trips needed changes as the pile shrinks, how many trips per km while over 2000 bananas remain? Over 1000?", "驮的趟数会随香蕉堆变小而改变——超过2000根时要跑几趟？超过1000根呢？", "This is the classic jeep problem. Above 2000 bananas it takes 3 trips per km (5 eaten per km). Between 1000-2000 it takes 2 trips (3 eaten per km). Below 1000, 1 trip (1 eaten per km). Working through the math: the maximum deliverable is 533 bananas.", "这是经典的吉普车问题。超过2000根时每公里跑3趟（吃5根）。1000-2000根时跑2趟（吃3根）。1000根以下跑1趟（吃1根）。算下来最多能送到533根。"],
    "m6-05": ["Try a moving-knife idea, someone moves a knife across the cake and anyone can call stop when it looks fair.", "试试移动刀的办法——有人把刀在蛋糕上移动，谁觉得公平就喊停。", "One classic method (last diminisher): person A cuts off what they think is 1/3. Person B can trim it if it looks too big, or pass. Person C chooses last among the piece and the rest, then B and A choose in order.", "一种经典办法叫渐减法：甲切下他认为的1/3。乙如果觉得太大可以修剪，或者不修。丙先在这块和剩下的蛋糕之间选一个，然后乙甲按顺序选。"],
    "m6-06": ["The two slowest people should cross together, not separately, to avoid wasting their slow speed twice.", "两个最慢的人应该一起过桥，而不是分开走，避免把慢浪费两次。", "1&2 cross (2min). 1 returns (1min, total3). 5&10 cross together (10min, total13). 2 returns (2min, total15). 1&2 cross again (2min, total17).", "1和2先过桥(2分钟)。1回来(1分钟，共3)。5和10一起过桥(10分钟，共13)。2回来(2分钟，共15)。1和2再过桥(2分钟，共17)。"],
    "m6-07": ["Instead of trying to identify which coins are heads, just pick any group and flip all of them.", "别去猜哪些是正面，直接随便挑一组全部翻面。", "Take any 3 coins to form pile B (rest form pile A), then flip every coin in pile B. This always makes both piles end up with the same number of heads, regardless of how many original heads landed in your chosen 3.", "随便拿3枚组成B堆(剩7枚是A堆)，把B堆全部翻面。不管原来选进B堆的3枚里有几枚正面，翻面后两堆正面数一定相同。"],
    "m6-08": ["Figure out which small numbers of remaining candies are traps versus safe, for both versions of the rule.", "先想清楚剩几颗糖是陷阱、几颗是安全的——两种规则都要想。", "Normal version: leave multiples of 3 for your opponent (take 1 first, leaving 9). Misere version (last take loses): the losing positions shift to numbers that are 1 more than a multiple of 3. Since 10 fits that pattern, the first player is actually at a disadvantage, meaning the second player wins with correct play.", "普通版本：每次给对方留3的倍数（先拿1颗留9颗）。算输版本：陷阱位置变成除以3余1的数。因为10正好是这种情况，这次反而是先手不利，也就是说对方玩得聪明的话，后手才会赢。"],
    "m6-09": ["Get the two extra women across first, in a clever back-and-forth, before bringing any men over.", "先想办法把多出来的女士弄过河，再考虑带男士。", "One solution: two wives cross, one returns, she and a third wife cross, she returns alone; then husbands cross in pairs while a wife is shuttled back each time to avoid any woman being left alone with a man who isn't her husband.", "一种方案：两位妻子过河，一人回来，她和第三位妻子过河，她自己回来；之后丈夫们两两过河，每次都用一位妻子换回来，避免任何女士和不是自己丈夫的男士单独留在一起。"],
    "m6-10": ["Check whether 100 itself is a Fibonacci number (1,1,2,3,5,8,13,21,34,55,89,144), that fact alone decides who wins.", "先看100本身是不是斐波那契数——光这一点就能决定谁赢。", "This is Fibonacci Nim. The first player wins if and only if the starting number is NOT a Fibonacci number. Since 100 isn't one (89 and 144 are its neighbors), the first player has a winning strategy, based on the Zeckendorf (Fibonacci) representation of 100.", "这是斐波那契取石子游戏。只有当起始数不是斐波那契数时先手才必胜。100不是斐波那契数（夹在89和144之间），所以先手确实有必胜策略，诀窍跟100的斐波那契分解有关。"],
    "m6-11": ["Work backward from the smallest case (2 pirates) and build up, thinking about the cheapest way to buy votes each step.", "从最简单的情况(2个海盗)倒推，每步想最便宜地买到需要的票数。", "With 2 pirates, the senior takes all 100. With 3, they give 1 coin to whoever would get 0 in the 2-pirate case, keeping 99. The pattern continues: the senior keeps the vast majority by giving 1 coin each to just enough lower pirates who'd otherwise get nothing.", "剩2人时资深者拿全部100枚。剩3人时给会拿0的那位1枚，自己留99。规律延续下去：最资深的能留下绝大部分，只需给刚好够票数、原本会拿0的低资历海盗每人1枚。"],
    "m6-12": ["The first player can guarantee a win by claiming the one spot on the table that lets them mirror every future move.", "先手可以占据一个特殊位置，之后每一步都能照镜子式地对称回应。", "The first player wins by placing the first coin exactly in the center. After that, mirror whatever spot the opponent uses through the center. Since the table is symmetric, the mirrored spot is always available too, so the opponent runs out of room first.", "先手必胜：第一枚硬币放正中心。之后不管对方放哪，你都以圆心对称放在正对面。因为桌子对称，对称位置永远放得下，最终是对方先没地方放。"],
    "m6-13": ["Instead of counting matches round by round, count how many players need to be eliminated in total.", "别一轮轮数比赛，直接想一共要淘汰多少人。", "99 matches. Every match eliminates exactly 1 player, and 99 players need to be eliminated to leave 1 champion from 100.", "99场。每场淘汰1人，要从100人淘汰到剩1个冠军，需要淘汰99人。"],
    "m6-14": ["Designate one person as the only one allowed to turn the light off, everyone else can only turn it on, and only once.", "指定1人当唯一负责关灯的人——其他人只能开灯，且一辈子只能开一次。", "Pick one prisoner as the counter. Every other prisoner turns the light on the first time they find it off, and never touches it again. The counter turns it off each time they find it on and counts. Once the counter reaches 99, everyone else has visited.", "指定1个囚犯当计数员。其他人第一次进房间发现灯关着就开灯，之后不再碰。计数员每次发现灯开着就关掉并计数。数到99时就知道所有人都进过房间了。"],
    "m6-15": ["What remainder, when you divide the distance to 50 by 3, tells you your very first move?", "50除以3的余数决定了你第一步该报几个数。", "First player wins by saying '1,2' first (leaving 48, a multiple of 3), then always responding so the total said that round is 3 (if they say 1, you say 2, and vice versa).", "先手必胜：第一次说1,2（留48，正好是3的倍数），之后不管对方报1还是2个，你都补足到这轮合计3个。"],
    "m6-16": ["The same one designated counter trick works here too, random selection only changes how long it might take.", "跟上一题一样的指定计数员办法在这里同样管用——随机挑选只影响要等多久。", "Same strategy as the 100-prisoner version: one counter turns the light off and counts, everyone else turns it on exactly once on their first visit. It may take longer since selection is random, but eventually the counter reaches N-1 and can declare with certainty.", "策略跟100人那题一样：1个计数员关灯计数，其他人第一次进房间就开灯一次。因为随机挑选可能要等更久，但计数员数到N-1时就能确定所有人都进过房间了。"],
    "m6-17": ["Work backward from the smallest case, what would happen if only 2 pirates were left?", "从最小情况倒推：如果只剩2个海盗会怎样？", "With 2 pirates, the senior proposes taking all 5 (their own vote is enough). Knowing that, with 3 pirates the senior gives the pirate who'd get 0 in that 2-pirate scenario just 1 gem to buy their vote, keeping 4 for themselves.", "剩2个海盗时，最资深的提议自己拿全部5颗（自己一票就够）。知道这一点后，剩3人时，资深者只需给会拿0的那位1颗宝石买票，自己留4颗。"],
    "g34-01": ["Each number is 2 more than the one before it.", "每个数都比前一个多2。", "10, 12 — the pattern adds 2 each time (these are the even numbers).", "10、12——每次加2（这是偶数数列）。"],
    "g34-02": ["Try multiplying each position number by itself: 1x1, 2x2, 3x3...", "试试把每个位置的序号自己乘自己：1×1、2×2、3×3……", "25 — these are square numbers (1x1, 2x2, 3x3, 4x4, 5x5).", "25——这些是平方数（1×1、2×2、3×3、4×4、5×5）。"],
    "g34-03": ["Try guessing: if all 8 were chickens, how many legs would that be? How many more legs do we actually have?", "试试假设：如果8只全是鸡，一共有多少条腿？实际比这多几条？", "3 rabbits and 5 chickens. If all 8 were chickens: 16 legs. We have 22, which is 6 more — each rabbit has 2 more legs than a chicken, so 6 ÷ 2 = 3 rabbits, leaving 5 chickens.", "3只兔子，5只鸡。假设8只全是鸡：16条腿。实际有22条，多了6条——每只兔比鸡多2条腿，6÷2=3只兔，剩下5只鸡。"],
    "g34-04": ["Count the small triangles first, then don't forget the one big triangle around the outside.", "先数小三角形，再别忘了数外面那个大三角形。", "5 — 4 small triangles (3 corner ones plus 1 in the middle) plus the 1 big outer triangle.", "5个——4个小三角形（3个角上的+中间1个）加上外面的1个大三角形。"],
    "g34-05": ["List two-digit numbers whose digits add to 9 (18, 27, 36...), then check which one also fits the second clue.", "先列出数字和为9的两位数（18、27、36……），再挑出符合第二个条件的那个。", "81 — digits 8 and 1 add to 9, and 8 is 7 more than 1.", "81——8和1加起来是9，8比1大7。"],
    "g34-06": ["Every path needs exactly 2 rights and 2 downs — try listing the orders: RRDD, RDRD, RDDR...", "每条路径都需要正好2次向右、2次向下——试试列出顺序：右右下下、右下右下、右下下右……", "6 paths in total (RRDD, RDRD, RDDR, DRRD, DRDR, DDRR).", "一共6种走法（右右下下、右下右下、右下下右、下右右下、下右下右、下下右右）。"],
    "m7-01": ["Check the AI's answer by working forward: if the number is 12, what do you get after +7 then x2?", "把AI的答案代回去验算一下：如果这个数是12，先加7再乘以2，结果是多少？", "AI is wrong. Checking: (12+7)x2=38, not 26 — so 12 fails. The mistake: AI only multiplied the 7 by 2, forgetting the original number also needs to be multiplied by 2 (the whole sum in the parentheses gets doubled). Correct approach: since (number+7)x2=26, number+7=13, so number=6. Check: (6+7)x2=13x2=26.", "AI错了。验算：(12+7)×2=38，不是26——12不对。错误在于：AI只把7乘了2，忘了原数也要乘以2（括号里的整个和都要乘2，不是只有7）。正确做法：(原数+7)×2=26，所以原数+7=13，原数=6。验算：(6+7)×2=13×2=26。"],
    "m7-02": ["The rule only tells you what happens IF it rains. Can the ground get wet for other reasons too?", "规则只告诉你下雨会怎样。地面湿了，还有没有别的原因？", "Not necessarily. The rule only says rain leads to wet ground, not the reverse (wet ground means rain). The ground could be wet from a sprinkler, someone spilling water, watering plants, etc. This is a classic reasoning trap - confusing 'if A then B' with 'if B then A' - worth watching for whenever an AI (or anyone) jumps to a conclusion.", "不一定。规则只说了'下雨→地面湿'，没说反过来'地面湿→一定下雨'。地面湿也可能是洒水车经过、有人洒了水、浇花等原因。这是一个经典的推理陷阱——把'如果A那么B'和'如果B那么A'搞混了，AI（或者任何人）下结论时都值得多留意这一点。"],
    "m7-03": ["'3 years older' only tells you the DIFFERENCE between their ages — does that pin down either actual age?", "'大3岁'只告诉你两人年龄的差——这能确定其中任何一个人的具体年龄吗？", "It cannot be solved as given. We only know the difference (3 years) — Xiaohong could be 5 and Xiaoming 8, or Xiaohong could be 10 and Xiaoming 13, and both fit 'Xiaoming is 3 years older.' We'd need at least one person's actual age to solve it. Before solving any problem (especially one an AI hands you), it's worth checking whether there's actually enough information to get a single definite answer.", "不能解出来。我们只知道两人年龄的差是3岁——小红5岁小明8岁，或者小红10岁小明13岁，都符合'小明大3岁'，答案不唯一。至少还需要知道小明或小红其中一人的实际年龄才能解。解题前（尤其是AI给你一道题的时候），先检查一下信息是否真的够用，能不能得到唯一确定的答案，是个很有用的习惯。"]
  };

  document.querySelectorAll(".quest").forEach(function(q){
    var id = q.getAttribute("data-q");
    var data = HELP[id];
    if(!data) return;
    var hintBtn = q.querySelector(".hint-btn");
    var giveupBtn = q.querySelector(".giveup-btn");
    var hintBox = q.querySelector(".hint-box");
    var answerBox = q.querySelector(".answer-box");

    hintBtn.addEventListener("click", function(){
      if(hintBox.hidden){
        hintBox.innerHTML = '<div class="en">' + data[0] + '</div><div class="zh">' + data[1] + '</div>';
        hintBox.hidden = false;
        hintBtn.classList.add("active");
      } else {
        hintBox.hidden = true;
        hintBtn.classList.remove("active");
      }
    });

    giveupBtn.addEventListener("click", function(){
      if(!answerBox.hidden){
        answerBox.hidden = true;
        giveupBtn.classList.remove("active");
        return;
      }
      if(confirm("确定要看答案吗？看了就不算自己想出来的哦～\nSee the answer? Only do this if you're ready to stop trying it yourself.")){
        answerBox.innerHTML = '<div class="en">' + data[2] + '</div><div class="zh">' + data[3] + '</div>';
        answerBox.hidden = false;
        giveupBtn.classList.add("active");
      }
    });
  });

  // read-aloud (browser text-to-speech)
  var speaking = null;
  function speak(btn){
    if(!('speechSynthesis' in window)){
      alert('这个浏览器不支持朗读功能，换成Chrome试试吧。\nThis browser doesn\'t support read-aloud — try Chrome.');
      return;
    }
    var lang = btn.getAttribute('data-lang');
    var quest = btn.closest('.quest');
    var textEl = quest.querySelector(lang === 'zh-CN' ? '.zh' : '.en');
    var text = textEl.textContent.trim();

    var wasSpeaking = btn.classList.contains('speaking');
    window.speechSynthesis.cancel();
    if(speaking){ speaking.classList.remove('speaking'); }
    speaking = null;
    if(wasSpeaking) return;

    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.onend = function(){ btn.classList.remove('speaking'); if(speaking === btn) speaking = null; };
    utter.onerror = function(){ btn.classList.remove('speaking'); if(speaking === btn) speaking = null; };
    btn.classList.add('speaking');
    speaking = btn;
    window.speechSynthesis.speak(utter);
  }
  document.querySelectorAll('.speak-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ speak(btn); });
  });
  window.addEventListener('beforeunload', function(){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  // theme toggle
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeBtn');
  var THEME_KEY = 'thinking.theme';
  var saved = localStorage.getItem(THEME_KEY);
  if(saved){ root.setAttribute('data-theme', saved); }
  themeBtn.addEventListener('click', function(){
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  });

  render();
})();
