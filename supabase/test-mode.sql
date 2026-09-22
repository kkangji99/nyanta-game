-- 테스트용 규칙 변경 (GAME_LEN = 60 으로 짧게 테스트할 때)
-- 정식 규칙은 "배달 성공 = 300초 생존"이라 1분 클리어 기록이 거부되므로 잠시 완화한다.

-- [1] 테스트 모드 켜기: 60초 이상 버티면 배달 성공으로 인정
alter table public.scores drop constraint if exists scores_cleared_match;
alter table public.scores add constraint scores_cleared_match check (not cleared or survived >= 60);

-- [2] 테스트 끝나고 정식으로 되돌리기 (GAME_LEN 을 300 으로 되돌린 뒤 실행)
--   테스트 중 쌓인 1분짜리 기록을 먼저 지워야 정식 규칙을 다시 걸 수 있음
-- delete from public.scores where cleared and survived < 300;
-- alter table public.scores drop constraint if exists scores_cleared_match;
-- alter table public.scores add constraint scores_cleared_match check (cleared = (survived >= 300));
