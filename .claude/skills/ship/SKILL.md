---
name: ship
description: 승인된 워크트리 브랜치를 main에 머지·검증·푸시하고 Jira를 검토 중으로 옮긴다. "머지하고 푸시해줘"에 사용.
---

# 머지·푸시

사용자가 명시적으로 승인한 브랜치에만 쓴다.

1. `git merge --ff-only <worktree-branch>`. 브랜치가 둘 이상이거나 ff가 안 되면 `git merge --no-edit`, 충돌은 직접 해결하고 사실대로 보고한다.
2. 검증: `npx tsc --noEmit`, `npm test`. 통과 수를 확인한다(`grep -E "^ℹ (pass|fail)"`). 실패하면 푸시하지 말고 원인을 보고한다.
3. 푸시: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`
4. 정리: `git worktree remove --force .claude/worktrees/<name>` 후 `git branch -D <branch>`.
5. Jira: 해당 티켓을 검토 중(전환 ID 31)으로 옮긴다. 완료(41)는 사용자가 확인했다고 말할 때만.
6. 보고: 푸시 범위(`a..b`), 테스트 수, 배포 전에 할 일(DB 백업, `.env` 값, `[확정 필요]` 항목)을 알린다. 배포는 하지 않는다.
