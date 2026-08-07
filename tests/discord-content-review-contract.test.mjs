import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const code = await readFile(new URL('../supabase/functions/discord-interactions/index.ts', import.meta.url), 'utf8');

describe('Discord content publishing contract', () => {
  it('requires an explicit channel and reviewer identity', () => {
    expect(code).toContain('interaction.channel_id !== DISCORD_CHANNEL_ID');
    expect(code).toContain('CONTENT_REVIEWER_USER_IDS');
    expect(code).toContain('CONTENT_REVIEWER_ROLE_IDS');
  });

  it('locks approval to the reviewed PR, label, branch and commit', () => {
    expect(code).toContain('pr.base?.ref !== "main"');
    expect(code).toContain('automated-content-update');
    expect(code).toContain('pr.head?.sha?.startsWith(reviewedSha)');
    expect(code).toContain('sha: pr.head.sha');
  });

  it('uses rebase merge so branch protection remains authoritative', () => {
    expect(code).toContain('merge_method: "rebase"');
    expect(code).not.toContain('direct_publish: true');
  });
});
