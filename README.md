# 思维闯关

一个中英双语的思维训练题网页。现在按年级分成了多个页面，另外保留最初的100题合集。

线上地址：`https://evolxd.github.io/kids-math-puzzles/`（GitHub Pages 部署后生效，一般几分钟内可访问）

## 页面结构

- [`grades.html`](grades.html) —— **年级选择入口**，从这里进
- [`grade3-4.html`](grade3-4.html) —— 三四年级入门题库（试点，6题，陆续增加）
- [`grade5-6.html`](grade5-6.html) —— 五六年级奥数基础题库（60题，内容最完整的一档，含"AI时代思维"专题）
- [`grade7-plus.html`](grade7-plus.html) —— 七年级+挑战题库（43题，包含几道世界级难题）
- [`index.html`](index.html) —— 最初的综合题库，100题不分年级，保留不动

各年级页面的题目难度按 [Math Kangaroo](https://mathkangaroo.org/) 1-2/3-4/5-6/7-8 和 [MOEMS](https://www.moems.org/) Division E(4-6)/M(6-8) 的通行分档校准，不是随便贴标签。

## 技术结构

- `shared.css` / `shared.js` —— 所有年级页面共用的样式和逻辑（题卡渲染、图示、双语朗读、家长中心、深浅色切换）。改功能只改这两个文件，不用每个年级页面都改一遍。
- 每个年级页面只有该年级的题目 HTML + 一小段内联脚本（设置 `TIER_PREFIX`/`WORLD_IDS`/`WORLD_TOTALS`），然后引用 `shared.js`。
- localStorage key 按年级加了前缀（如 `thinking.g56.solved.v1`），不同年级/不同孩子的打卡记录不会互相覆盖。深浅色主题偏好是全站共用的（`thinking.theme`）。

## 六大板块（五六年级、七年级+页面都用这套分类）

1. 称重与信息推理 — Weighing & Information Logic
2. 组合与计数思维 — Combinatorics & Counting
3. 逻辑推演谜题 — Deductive Logic Puzzles
4. 空间与几何思维 — Spatial & Geometric Thinking
5. 数字游戏与数论 — Number Games & Number Theory
6. 策略博弈与决策 — Game Strategy & Optimal Decisions
7. AI时代思维 — AI-Era Thinking（仅五六年级页面，试点中）

打卡进度只保存在本机浏览器（localStorage），换设备或清除浏览器数据会重置。免费产品，没有账号/付费系统。
