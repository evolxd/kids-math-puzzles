# PK快题库 · 草稿（待你审阅，还没接入代码）

2026-07-31 · 起草流程：DeepSeek(via OpenRouter)起草 → Claude逐题核算审查。第1轮15题：9题原样通过、2题错误已修正、4题剔除。第2轮补4道替换题：2题通过、2题剔除（1题算错、1题跟已通过题撞题）。目前共13题通过。详见文末"剔除记录"。这一批还没接入任何页面/`shared.js`，纯内容草稿，等你看过再决定要不要正式收录。

## 已通过（13题）

### 1
**EN**: What is the next number in the sequence: 2, 5, 10, 17, 26, __?
**ZH**: 找规律填数：2，5，10，17，26，__？
**Hint EN**: Look at the differences between consecutive terms, or think about square numbers.
**Hint ZH**: 观察相邻两项的差，或联想平方数。
**Answer EN**: 37. The sequence is n²+1: 1²+1=2 … 5²+1=26, so next is 6²+1=37.
**Answer ZH**: 37。规律是n²+1，下一项是6²+1=37。

### 2
**EN**: A two-digit number has its digits swapped to form a new number. The new number is 36 greater than the original. The sum of the original number's digits is 6. What is the original number?
**ZH**: 一个两位数，交换十位与个位数字后，新数比原数大36，原数两个数字之和为6，原数是多少？
**Hint EN**: Let tens=a, units=b. Express the difference in terms of a and b.
**Hint ZH**: 设十位为a，个位为b，用a、b表示两数之差。
**Answer EN**: 15. 9(b-a)=36 → b-a=4; a+b=6 → a=1,b=5.
**Answer ZH**: 15。9(b-a)=36得b-a=4，又a+b=6，解得a=1，b=5，原数为15。

### 3
**EN**: Three boxes A, B, C — one has a gold coin. A: "The gold is in here." B: "The gold is not in here." C: "The gold is not in Box A." Only one statement is true. Where is the gold?
**ZH**: 三个盒子A、B、C，一个装金币。A说"金币在这里"，B说"金币不在这里"，C说"金币不在A盒"。只有一句是真话，金币在哪？
**Hint EN**: Try each box as the true statement and check for contradictions.
**Hint ZH**: 依次假设每句话为真，看是否矛盾。
**Answer EN**: Box B. (Verified independently — this is the only location where exactly one statement comes out true.)
**Answer ZH**: B盒。（已独立复核，唯一能让"恰好一句真话"成立的情况。）

### 4
**EN**: A cube is painted red on all faces, then cut into 27 identical small cubes. How many have exactly two red faces?
**ZH**: 一个立方体所有面涂红后切成27个小立方体，恰好有两面红色的小立方体有多少个？
**Hint EN**: Think about which small cubes sit on an edge but not a corner.
**Hint ZH**: 想想哪些小立方体在棱上但不在顶点上。
**Answer EN**: 12 — the non-corner cube on each of the 12 edges.
**Answer ZH**: 12个——每条棱上非顶点的那个小立方体，共12条棱。

### 5
**EN**: At 3:15, what is the angle between the hour and minute hands of an analog clock?
**ZH**: 3点15分时，时钟时针和分针的夹角是多少度？
**Hint EN**: The minute hand points exactly at 3; the hour hand has crept past 3.
**Hint ZH**: 分针正好指向3，时针已经往前挪了一点。
**Answer EN**: 7.5°. Hour hand at 97.5° (90°+7.5°), minute hand at 90°.
**Answer ZH**: 7.5°。时针在97.5°（90°+7.5°），分针在90°。

### 6 （原题7，已修正措辞）
**EN**: A 5×5 grid of equally spaced points forms a square. How many different squares (of any size) can be drawn using these points as vertices?
**ZH**: 一个5×5的点阵构成正方形。以这些点为顶点，能画出多少个大小不同的正方形？
**Hint EN**: Count by side length: 1×1, 2×2, 3×3, 4×4, then add.
**Hint ZH**: 按边长分类数：1×1、2×2、3×3、4×4，再相加。
**Answer EN**: 30 (16+9+4+1).
**Answer ZH**: 30个（16+9+4+1）。
> 原题写的是"4×4点阵"但答案按5×5点阵算的，两者对不上——已把题面改成5×5，和答案30对齐。

### 7 （原题8）
**EN**: A father is 40, his son is 10. In how many years will the father be exactly three times as old as his son?
**ZH**: 父亲40岁，儿子10岁，几年后父亲年龄恰好是儿子的3倍？
**Hint EN**: 40+x = 3(10+x).
**Hint ZH**: 列方程 40+x = 3(10+x)。
**Answer EN**: 5 years.
**Answer ZH**: 5年后。

### 8 （原题11，答案已修正）
**EN**: A three-digit number: the hundreds digit is twice the units digit, the tens digit is one less than the hundreds digit, and the three digits sum to 14. What is the number?
**ZH**: 一个三位数，百位是个位的2倍，十位比百位小1，三个数字之和为14，这个数是多少？
**Hint EN**: Let units=x, express hundreds and tens in terms of x.
**Hint ZH**: 设个位为x，用x表示百位和十位。
**Answer EN**: 653. units=3, hundreds=2×3=6, tens=6-1=5. Sum 6+5+3=14. ✓
**Answer ZH**: 653。个位3，百位2×3=6，十位6-1=5，验证6+5+3=14。
> 原答案写的是634，代回原题条件对不上（百位应该是个位2倍，6≠2×4）——已重新算出正确答案653。

### 9 （原题13）
**EN**: Figure 1 has 1 dot, figure 2 has 3 dots (triangle), figure 3 has 6 dots, each new figure adds a row. How many dots in figure 10?
**ZH**: 第1个图1个点，第2个图3个点（三角形排列），第3个图6个点，每个新图加一行。第10个图有多少个点？
**Hint EN**: These are triangular numbers: n(n+1)/2.
**Hint ZH**: 这是三角形数，公式n(n+1)/2。
**Answer EN**: 55 (10×11/2).
**Answer ZH**: 55（10×11÷2）。

### 10 （原题14）
**EN**: A regular hexagon is rotated around its center. What is the smallest positive angle that makes it look exactly the same?
**ZH**: 正六边形绕中心旋转，最少转多少度会和原来完全重合？
**Hint EN**: A regular hexagon has 6-fold symmetry.
**Hint ZH**: 正六边形有6重对称。
**Answer EN**: 60° (360°/6).
**Answer ZH**: 60°（360°÷6）。

### 11 （原题15）
**EN**: Which digits (0-9) can never be the last digit of a perfect square?
**ZH**: 0到9中，哪些数字不可能是完全平方数的个位数字？
**Hint EN**: Square 0 through 9 and check the last digits.
**Hint ZH**: 把0到9平方一遍，看看个位都有什么。
**Answer EN**: 2, 3, 7, 8.
**Answer ZH**: 2、3、7、8。

### 12 （第2轮新增）
**EN**: Find the next number in the sequence: 2, 12, 36, 80, 150, ?
**ZH**: 找出数列的下一项：2, 12, 36, 80, 150, ？
**Hint EN**: Try expressing each term as n² × (n+1).
**Hint ZH**: 试着把每一项写成 n² × (n+1) 的形式。
**Answer EN**: 252. Pattern is n²×(n+1): 1²×2=2, 2²×3=12, 3²×4=36, 4²×5=80, 5²×6=150, next 6²×7=252.
**Answer ZH**: 252。规律是n²×(n+1)：1²×2=2…5²×6=150，下一项6²×7=252。

### 13 （第2轮新增）
**EN**: "If it is snowing, the temperature must be at or below 0°C." Today it's -5°C. Can we conclude it is snowing? Why or why not?
**ZH**: "如果下雪，气温一定在0°C或以下。"今天气温是-5°C，能断定在下雪吗？为什么？
**Hint EN**: The condition given is necessary for snow, not sufficient — could there be a cold day with no snow?
**Hint ZH**: 给出的条件是下雪的必要条件，不是充分条件——会不会有又冷又没下雪的天气？
**Answer EN**: No. Low temperature is necessary for snow but not sufficient — it could simply be a cold, clear day with no precipitation.
**Answer ZH**: 不能。低温是下雪的必要条件，不是充分条件——完全可能只是一个寒冷但没有降水的晴天。

## 剔除记录

**第1轮（4题）**：
1. **字母找规律 A,E,I,O,__（答U）**——本质是"元音字母"常识题，不需要推理，跟产品"思维闯关"的定位不符，剔除。
2. **打破花瓶找说谎者**（Alice/Bob/Charlie三人，只一人说真话）——我自己重新推了一遍逻辑，发现这题有**两个都成立的答案**（Bob或Charlie），不是唯一解。DeepSeek的推理在检查"如果Bob说真话"这个分支时漏掉了Charlie也是嫌疑人，错误地判定"无人打破=不可能"，实际上"Charlie打破"在逻辑上完全自洽。题目本身有缺陷，剔除（第3题的盒子版本是同一类型的正确版本，够用了）。
3. **9枚硬币2次称出假币**——算法本身没错，但跟World 1已有的"9个球2次称出"高度重复，剔除避免撞题。
4. **下雨地面湿的逻辑题**——跟已上线的`m7-02`基本是同一个例子（我起草prompt时拿它当风格参考，被原样抄回来了，我的失误），剔除。

**第2轮（2题）**：
1. **2:15后时针分针多久重合**——我自己重新算了一遍：DeepSeek算的是"分针追上时针差22.5°"，但那个时刻分针其实已经超过时针、正在拉开距离，要重合得再转almost一整圈，正确答案约61分钟，不是它说的"约4分钟"——方向性错误，而且就算改对了，这类追及问题本身也不适合"30秒-2分钟"的PK节奏，剔除。
2. **3厘米立方体涂色切割**——数学本身没错，但跟本文档里已经通过的第4题（27个小立方体那道）是同一个题型、同一个答案(12)，属于跟自己人撞题，剔除。

## 下一步

13题目前的状态。预算内的3次DeepSeek调用已经用了2次，还剩1次。要不要用最后1次额度再凑2题到15题，还是13题作为v1试点已经够用？
