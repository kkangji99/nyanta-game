-- 냥타의 고군분투 온라인 랭킹 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  nickname    text        not null,
  survived    integer     not null,
  cleared     boolean     not null default false,
  kills       integer     not null,
  level       integer     not null,
  created_at  timestamptz not null default now(),

  -- 말이 안 되는 값은 DB에서 거름 (클라이언트 조작 완화용)
  constraint scores_nickname_len check (char_length(btrim(nickname)) between 1 and 8),
  constraint scores_survived_range check (survived between 0 and 300),
  constraint scores_cleared_match check (cleared = (survived >= 300)),
  constraint scores_kills_range check (kills between 0 and survived * 10 + 30),
  constraint scores_level_range check (level between 1 and 60)
);

comment on table  public.scores            is '냥타의 고군분투 랭킹 기록';
comment on column public.scores.id         is '기록 번호';
comment on column public.scores.nickname   is '플레이어 닉네임 (1~8자)';
comment on column public.scores.survived   is '버틴 시간(초, 0~300)';
comment on column public.scores.cleared    is '배달 성공 여부 (true: 5분 생존, false: 도중 탈락)';
comment on column public.scores.kills      is '물리친 적 수';
comment on column public.scores.level      is '도달한 레벨';
comment on column public.scores.created_at is '등록 시각';

-- 순위 정렬: 배달 성공 > 버틴 시간 > 처치 수 > 먼저 등록한 순
create index if not exists scores_rank_idx
  on public.scores (cleared desc, survived desc, kills desc, created_at asc);

-- 행 단위 보안: 누구나 조회·등록만 가능, 수정·삭제는 불가
alter table public.scores enable row level security;

drop policy if exists "scores_select_all" on public.scores;
create policy "scores_select_all" on public.scores
  for select to anon, authenticated using (true);

drop policy if exists "scores_insert_all" on public.scores;
create policy "scores_insert_all" on public.scores
  for insert to anon, authenticated with check (true);

grant select, insert on public.scores to anon, authenticated;

-- 같은 닉네임으로 10초 안에 연속 등록하는 것을 막음
create or replace function public.scores_throttle() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.nickname := btrim(new.nickname);
  new.created_at := now();
  if exists (select 1 from public.scores
             where nickname = new.nickname and created_at > now() - interval '10 seconds') then
    raise exception '잠시 후 다시 등록해 주세요' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists scores_throttle on public.scores;
create trigger scores_throttle before insert on public.scores
  for each row execute function public.scores_throttle();
