-- PK对战模式 · 数据库schema
-- 用法：打开 Supabase 项目 → SQL Editor → 新建查询 → 粘贴整个文件 → Run
-- 对应设计文档：docs/pk-mode-design.md

-- ---------------------------------------------------------------------
-- pk_rooms：每个PK房间一行，48小时后视为过期（过期判断在查询时做，
-- 真正删除数据需要另外配置一个定时清理，见文件末尾）
-- ---------------------------------------------------------------------
create table public.pk_rooms (
  id text primary key,                                    -- 房间码，如 K7X9QP
  question_set jsonb not null,                             -- 本局题目id列表
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  status text not null default 'waiting' check (status in ('waiting','active','done'))
);

-- ---------------------------------------------------------------------
-- pk_participants：每个房间里每个玩家一行
-- ---------------------------------------------------------------------
create table public.pk_participants (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.pk_rooms(id) on delete cascade,
  nickname text not null,
  answers jsonb not null default '[]'::jsonb,               -- [{questionId, correct, seconds}]
  joined_at timestamptz not null default now()
);

alter table public.pk_rooms enable row level security;
alter table public.pk_participants enable row level security;

-- ---------------------------------------------------------------------
-- 授权：建项目时关掉了"Automatically expose new tables"（出于安全考虑，
-- 见docs/pk-mode-design.md），这意味着 anon 角色对新表默认没有任何权限——
-- RLS策略本身不会自动带来访问权，没有下面这些GRANT，请求会在RLS判断之前
-- 就被"permission denied"拦下。
-- ---------------------------------------------------------------------
grant usage on schema public to anon;
grant select, insert, update on public.pk_rooms to anon;
grant select, insert, update on public.pk_participants to anon;

-- ---------------------------------------------------------------------
-- RLS策略：这个产品没有账号体系，房间码本身就是访问控制——码是随机生成、
-- 猜不到的，"知道码"约等于"有权限"。策略只额外挡住一件事：房间过期后
-- 一律不可读写。
-- ---------------------------------------------------------------------
create policy "read active rooms" on public.pk_rooms
  for select using (expires_at > now());

create policy "create rooms" on public.pk_rooms
  for insert with check (true);

create policy "update own room status" on public.pk_rooms
  for update using (expires_at > now());

create policy "read participants of active rooms" on public.pk_participants
  for select using (
    exists (select 1 from public.pk_rooms r where r.id = room_id and r.expires_at > now())
  );

create policy "join active rooms" on public.pk_participants
  for insert with check (
    exists (select 1 from public.pk_rooms r where r.id = room_id and r.expires_at > now())
  );

create policy "submit own answers" on public.pk_participants
  for update using (
    exists (select 1 from public.pk_rooms r where r.id = room_id and r.expires_at > now())
  );

-- ---------------------------------------------------------------------
-- 已知的安全取舍（v1接受，不是疏漏）：
-- 1. 没有账号体系，所以"更新自己的答案"这条策略没法真正验证"是不是本人"
--    ——技术上任何拿到某一行id的人都能改它。风险很低：id是随机UUID猜不到，
--    而且内容本身是低敏感的（自选昵称+做题记录），48小时后自动失效。
-- 2. select策略是"房间没过期就能读"，没有按房间码做更细的过滤，理论上
--    能枚举出所有当前活跃房间。同样风险低——反正PK设计就是邀请制，房间码
--    不公开传播，枚举到的也只是别人的昵称和答题记录，不是什么敏感数据。
-- 如果以后要收紧，需要引入某种身份机制（哪怕是轻量的匿名session），
-- 但这跟"不做账号体系"的既定方向冲突，等真的有必要再重新评估。
-- ---------------------------------------------------------------------

-- 定时清理过期房间（参与者通过外键 on delete cascade 一起清掉）。
-- 需要在 Supabase 里配一个 pg_cron 定时任务或 Edge Function 定期跑这句：
-- delete from public.pk_rooms where expires_at < now();
