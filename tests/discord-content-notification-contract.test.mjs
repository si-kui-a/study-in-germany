import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const notifier = await readFile(new URL('../supabase/functions/content-review-notify/index.ts', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/content-review-discord.yml', import.meta.url), 'utf8');

describe('Discord content review notification contract', () => {
  it('only notifies after successful pull request CI', () => {
    expect(workflow).toContain("workflow_run.conclusion == 'success'");
    expect(workflow).toContain("workflow_run.event == 'pull_request'");
    expect(workflow).toContain('automated-content-update');
  });

  it('revalidates repository, PR, branch, label and exact commit', () => {
    expect(notifier).toContain('payload.repository !== REPOSITORY');
    expect(notifier).toContain('pr.base?.ref !== "main"');
    expect(notifier).toContain('pr.head?.sha !== payload.head_sha');
    expect(notifier).toContain('automated-content-update');
  });

  it('requires complete evidence before showing publish controls', () => {
    for (const field of ['來源', '舊值', '新值', '原文上下文', '適用對象', '生效日期', '風險等級']) expect(notifier).toContain(field);
    expect(notifier).toContain('content:approve:');
    expect(notifier).toContain('content:reject:');
  });
});
