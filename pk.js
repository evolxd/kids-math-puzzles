(function(){
  'use strict';

  var SUPABASE_URL = 'https://vvikybxngqctqpzzphbu.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_bw6I1NBDw-xlRuDQ9akBlw_cFgcPraa'; // publishable key: safe client-side, RLS enforces access
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  var CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L, avoids visual ambiguity
  function generateRoomCode(){
    var s = '';
    for(var i = 0; i < 6; i++){ s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]; }
    return s;
  }

  // PK快题库：审核通过的13题（docs/pk-question-bank-draft.md）
  var QUESTIONS = [
    { id:'pk-01', en:'What is the next number in the sequence: 2, 5, 10, 17, 26, __?', zh:'找规律填数：2，5，10，17，26，__？',
      hintEn:'Look at the differences between consecutive terms, or think about square numbers.', hintZh:'观察相邻两项的差，或联想平方数。',
      answerEn:'37. The sequence is n²+1: 1²+1=2 … 5²+1=26, so next is 6²+1=37.', answerZh:'37。规律是n²+1，下一项是6²+1=37。',
      accept:['37'], category:'puzzle', tier:'g7p' },
    { id:'pk-02', en:"A two-digit number has its digits swapped to form a new number. The new number is 36 greater than the original. The sum of the original number's digits is 6. What is the original number?", zh:'一个两位数，交换十位与个位数字后，新数比原数大36，原数两个数字之和为6，原数是多少？',
      hintEn:'Let tens=a, units=b. Express the difference in terms of a and b.', hintZh:'设十位为a，个位为b，用a、b表示两数之差。',
      answerEn:'15. 9(b-a)=36 → b-a=4; a+b=6 → a=1,b=5.', answerZh:'15。9(b-a)=36得b-a=4，又a+b=6，解得a=1，b=5，原数为15。',
      accept:['15'], category:'academic', tier:'g7p' },
    { id:'pk-03', en:'Three boxes A, B, C — one has a gold coin. A: "The gold is in here." B: "The gold is not in here." C: "The gold is not in Box A." Only one statement is true. Where is the gold?', zh:'三个盒子A、B、C，一个装金币。A说"金币在这里"，B说"金币不在这里"，C说"金币不在A盒"。只有一句是真话，金币在哪？',
      hintEn:'Try each box as the true statement and check for contradictions.', hintZh:'依次假设每句话为真，看是否矛盾。',
      answerEn:'Box B — the only location where exactly one statement comes out true.', answerZh:'B盒——唯一能让"恰好一句真话"成立的情况。',
      matchLetter:'b', category:'puzzle', tier:'g7p' },
    { id:'pk-04', en:'A cube is painted red on all faces, then cut into 27 identical small cubes. How many have exactly two red faces?', zh:'一个立方体所有面涂红后切成27个小立方体，恰好有两面红色的小立方体有多少个？',
      hintEn:'Think about which small cubes sit on an edge but not a corner.', hintZh:'想想哪些小立方体在棱上但不在顶点上。',
      answerEn:'12 — the non-corner cube on each of the 12 edges.', answerZh:'12个——每条棱上非顶点的那个小立方体，共12条棱。',
      accept:['12','12个'], category:'puzzle', tier:'g7p' },
    { id:'pk-05', en:'At 3:15, what is the angle between the hour and minute hands of an analog clock?', zh:'3点15分时，时钟时针和分针的夹角是多少度？',
      hintEn:'The minute hand points exactly at 3; the hour hand has crept past 3.', hintZh:'分针正好指向3，时针已经往前挪了一点。',
      answerEn:'7.5°. Hour hand at 97.5°, minute hand at 90°.', answerZh:'7.5°。时针在97.5°，分针在90°。',
      accept:['7.5','7.5°'], category:'academic', tier:'g7p' },
    { id:'pk-06', en:'A 5×5 grid of equally spaced points forms a square. How many different squares (of any size) can be drawn using these points as vertices?', zh:'一个5×5的点阵构成正方形。以这些点为顶点，能画出多少个大小不同的正方形？',
      hintEn:'Count by side length: 1×1, 2×2, 3×3, 4×4, then add.', hintZh:'按边长分类数：1×1、2×2、3×3、4×4，再相加。',
      answerEn:'30 (16+9+4+1).', answerZh:'30个（16+9+4+1）。',
      accept:['30','30个'], category:'puzzle', tier:'g7p' },
    { id:'pk-07', en:'A father is 40, his son is 10. In how many years will the father be exactly three times as old as his son?', zh:'父亲40岁，儿子10岁，几年后父亲年龄恰好是儿子的3倍？',
      hintEn:'40+x = 3(10+x).', hintZh:'列方程 40+x = 3(10+x)。',
      answerEn:'5 years.', answerZh:'5年后。',
      accept:['5','5年','5年后'], category:'academic', tier:'g7p' },
    { id:'pk-08', en:'A three-digit number: the hundreds digit is twice the units digit, the tens digit is one less than the hundreds digit, and the three digits sum to 14. What is the number?', zh:'一个三位数，百位是个位的2倍，十位比百位小1，三个数字之和为14，这个数是多少？',
      hintEn:'Let units=x, express hundreds and tens in terms of x.', hintZh:'设个位为x，用x表示百位和十位。',
      answerEn:'653. units=3, hundreds=6, tens=5. Sum 6+5+3=14.', answerZh:'653。个位3，百位6，十位5，验证6+5+3=14。',
      accept:['653'], category:'academic', tier:'g7p' },
    { id:'pk-09', en:'Figure 1 has 1 dot, figure 2 has 3 dots (triangle), figure 3 has 6 dots, each new figure adds a row. How many dots in figure 10?', zh:'第1个图1个点，第2个图3个点（三角形排列），第3个图6个点，每个新图加一行。第10个图有多少个点？',
      hintEn:'These are triangular numbers: n(n+1)/2.', hintZh:'这是三角形数，公式n(n+1)/2。',
      answerEn:'55 (10×11/2).', answerZh:'55（10×11÷2）。',
      accept:['55','55个'], category:'academic', tier:'g7p' },
    { id:'pk-10', en:'A regular hexagon is rotated around its center. What is the smallest positive angle that makes it look exactly the same?', zh:'正六边形绕中心旋转，最少转多少度会和原来完全重合？',
      hintEn:'A regular hexagon has 6-fold symmetry.', hintZh:'正六边形有6重对称。',
      answerEn:'60° (360°/6).', answerZh:'60°（360°÷6）。',
      accept:['60','60°'], category:'puzzle', tier:'g7p' },
    { id:'pk-11', en:'Which digits (0-9) can never be the last digit of a perfect square?', zh:'0到9中，哪些数字不可能是完全平方数的个位数字？',
      hintEn:'Square 0 through 9 and check the last digits.', hintZh:'把0到9平方一遍，看看个位都有什么。',
      answerEn:'2, 3, 7, 8.', answerZh:'2、3、7、8。',
      acceptAll:['2','3','7','8'], category:'puzzle', tier:'g7p' },
    { id:'pk-12', en:'Find the next number in the sequence: 2, 12, 36, 80, 150, ?', zh:'找出数列的下一项：2, 12, 36, 80, 150, ？',
      hintEn:'Try expressing each term as n² × (n+1).', hintZh:'试着把每一项写成 n² × (n+1) 的形式。',
      answerEn:'252. Pattern is n²×(n+1): …5²×6=150, next 6²×7=252.', answerZh:'252。规律是n²×(n+1)：…5²×6=150，下一项6²×7=252。',
      accept:['252'], category:'academic', tier:'g7p' },
    { id:'pk-13', en:'"If it is snowing, the temperature must be at or below 0°C." Today it\'s -5°C. Can we conclude it is snowing?', zh:'"如果下雪，气温一定在0°C或以下。"今天气温是-5°C，能断定在下雪吗？',
      hintEn:'The condition given is necessary for snow, not sufficient — could there be a cold day with no snow?', hintZh:'给出的条件是下雪的必要条件，不是充分条件——会不会有又冷又没下雪的天气？',
      answerEn:'No. Low temperature is necessary for snow but not sufficient — it could be a cold, clear day with no precipitation.', answerZh:'不能。低温是下雪的必要条件，不是充分条件——完全可能只是寒冷但没有降水的晴天。',
      type:'yesno', correct:false, labelYes:'能 Yes', labelNo:'不能 No', category:'puzzle', tier:'g7p' },
    { id:'pk-14', en:"The wizard's frog collection grows like this: 1, 4, 9, 16, __? How many frogs on day 5?", zh:'巫师收集的青蛙数量是这样长的：1，4，9，16，__？第5天有几只青蛙？',
      hintEn:'Think about whether each number is something multiplied by itself.', hintZh:'想想每个数字是不是某个数自己乘自己。',
      answerEn:'25. Each day\'s count is the day number times itself: 1×1, 2×2, 3×3, 4×4, 5×5=25.', answerZh:'25。每天的数量是"第几天"自己乘自己：1×1，2×2，3×3，4×4，5×5=25。',
      accept:['25','25只'], category:'puzzle', tier:'g34' },
    { id:'pk-15', en:'Two penguins, Fatty and Slim. Fatty says "Slim is lying." Slim says "We are both telling the truth." Who is actually lying?', zh:'胖企鹅和瘦企鹅。胖企鹅说"瘦企鹅在撒谎"，瘦企鹅说"我们俩说的都是真话"。到底谁在撒谎？',
      hintEn:'Assume Slim is telling the truth, and see if that leads to a contradiction.', hintZh:'假设瘦企鹅说的是真话，看看会不会自相矛盾。',
      answerEn:'Slim. If Slim were truthful, Fatty would also have to be truthful (per Slim\'s claim) — but then Fatty\'s "Slim is lying" would be true, contradicting Slim being truthful. So Slim must be lying.', answerZh:'瘦企鹅。假设瘦企鹅说真话，那胖企鹅也该说真话（因为瘦企鹅说"我们俩都真"）——但胖企鹅说"瘦企鹅在撒谎"就变成真的了，矛盾。所以瘦企鹅在撒谎。',
      matchAny:['瘦企鹅','瘦','slim'], category:'puzzle', tier:'g34' },
    { id:'pk-16', en:'You have 3 identical treasure chests, but one is heavier. Using a balance scale just once, can you always find it?', zh:'3个一样的宝箱，其中一个更重，天平只称1次，一定能找出来吗？',
      hintEn:"Don't just think about the two chests you weigh — think about where the third, untested one fits in.", hintZh:'别只想着称的那两个，也想想没被称的第三个箱子在哪种情况下也能确定。',
      answerEn:'Yes. Weigh any 2 of the 3. If they balance, the untested one is the heavy one. If not, the heavier side is it.', answerZh:'能。任选2个称：不平的话，重的那边就是；平的话，剩下没称的那个就是。',
      type:'yesno', correct:true, labelYes:'能 Yes', labelNo:'不能 No', category:'puzzle', tier:'g34' },
    { id:'pk-17', en:'Three furry monsters — Red, Blue, Green — each ate a different snack: cookie, candy, carrot. Red didn\'t eat candy. The carrot-eater isn\'t Blue. Green ate the cookie. Who ate the candy?', zh:'红蓝绿三只小怪兽各吃了不同的零食：饼干、糖果、胡萝卜。红色没吃糖果，吃胡萝卜的不是蓝色，绿色吃了饼干。谁吃了糖果？',
      hintEn:"Green's snack is already fixed — work out what's left for Red and Blue from there.", hintZh:'绿色的零食已经确定了，从这里推出红色和蓝色剩下的零食。',
      answerEn:'Blue. Green=cookie. Red isn\'t candy, so Red=carrot, leaving Blue=candy (and Blue isn\'t the carrot-eater, consistent).', answerZh:'蓝色。绿色=饼干；红色不吃糖果，所以红色=胡萝卜；剩下蓝色=糖果（蓝色也确实不是胡萝卜的那个，吻合）。',
      matchAny:['蓝色','蓝','blue'], category:'puzzle', tier:'g34' }
  ];

  function questionById(id){
    for(var i = 0; i < QUESTIONS.length; i++){ if(QUESTIONS[i].id === id) return QUESTIONS[i]; }
    return null;
  }

  // v1: PK只从"智力题"里抽题（逻辑/空间/找规律，不需要列方程），不用"数学学术题"
  // （需要设方程求解的）开局——避免第一次玩PK就被硬核代数题劝退。再按tier（g34/g7p）
  // 进一步筛，让创建房间的人能选一个跟对手水平匹配的难度池。
  function pickQuestionSet(n, tier){
    var pool = QUESTIONS.filter(function(q){ return q.category === 'puzzle' && q.tier === tier; });
    for(var i = pool.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, n).map(function(q){ return q.id; });
  }

  function normalizeAnswer(s){
    return String(s || '').trim().toLowerCase().replace(/[°、，,\s]/g, '');
  }

  function checkAnswer(question, userInput){
    if(question.type === 'yesno'){
      return userInput === question.correct;
    }
    var norm = normalizeAnswer(userInput);
    if(!norm) return false;
    if(question.acceptAll){
      return question.acceptAll.every(function(tok){ return norm.indexOf(normalizeAnswer(tok)) !== -1; });
    }
    if(question.matchLetter){
      var re = new RegExp('(^|[^a-z])' + question.matchLetter + '([^a-z]|$)', 'i');
      return re.test(norm);
    }
    if(question.matchAny){
      return question.matchAny.some(function(tok){ return norm.indexOf(normalizeAnswer(tok)) !== -1; });
    }
    return question.accept.some(function(a){ return norm === normalizeAnswer(a); });
  }

  async function createRoom(questionCount, tier){
    var qids = pickQuestionSet(questionCount || 5, tier || 'g7p');
    for(var attempt = 0; attempt < 3; attempt++){
      var code = generateRoomCode();
      var res = await sb.from('pk_rooms').insert({ id: code, question_set: qids, status: 'waiting' });
      if(!res.error) return { code: code, questionIds: qids };
      if(res.error.code !== '23505') throw res.error; // not a unique-violation on room code, rethrow
    }
    throw new Error('房间码生成失败，请重试 / Could not generate a room code, please retry');
  }

  async function getRoom(code){
    var res = await sb.from('pk_rooms').select('*').eq('id', code).maybeSingle();
    if(res.error) throw res.error;
    return res.data;
  }

  async function joinRoom(code, nickname){
    var room = await getRoom(code);
    if(!room) throw new Error('房间不存在或已过期 / Room not found or expired');
    var res = await sb.from('pk_participants').insert({ room_id: code, nickname: nickname, answers: [] }).select().single();
    if(res.error) throw res.error;
    return { participantId: res.data.id, room: room };
  }

  async function submitAnswers(participantId, answers){
    var res = await sb.from('pk_participants').update({ answers: answers }).eq('id', participantId);
    if(res.error) throw res.error;
  }

  async function getParticipants(code){
    var res = await sb.from('pk_participants').select('*').eq('room_id', code);
    if(res.error) throw res.error;
    return res.data || [];
  }

  window.PK = {
    QUESTIONS: QUESTIONS,
    questionById: questionById,
    checkAnswer: checkAnswer,
    createRoom: createRoom,
    getRoom: getRoom,
    joinRoom: joinRoom,
    submitAnswers: submitAnswers,
    getParticipants: getParticipants
  };
})();
