# Skills Research & Recommendations (research only — nothing installed)

**Question:** Which Claude Code Agent Skills could help the team get consistent results when different developers execute the same PRD? Are Supabase/Bolt guideline skills available, and are they safe?

**Method note:** Findings verified live on GitHub where possible (this environment blocks general web search; supabase.com pages could not be fetched directly, but their GitHub sources were verified). Bolt guidance is from model knowledge of support.bolt.new — spot-check the URLs before relying on specifics.

---

## 1. Recommended list (in order of value)

| # | Skill / resource | What it is | Trust assessment | Recommendation |
|---|------------------|------------|------------------|----------------|
| 1 | **`supabase/agent-skills`** — github.com/supabase/agent-skills | **Official Supabase skill repo (verified live).** Two skills: `supabase` (Auth, Edge Functions, Storage, Realtime, RLS, client libs) and `supabase-postgres-best-practices` (8 categories incl. Security & RLS). MIT, official org, 2.6k★, actively maintained (pushed today). ~700k combined installs on skills.sh. Install paths: `npx skills add supabase/agent-skills` or `claude plugin marketplace add supabase/agent-skills` | **High** — official vendor, exactly your stack | **Top pick.** Directly covers plans 02 & 05 (RLS, Edge Functions) |
| 2 | **Supabase official "AI Prompts"** — github.com/supabase/supabase → `examples/prompts/` (verified live) | 8 plain-markdown prompt files: `database-rls-policies.md`, `edge-functions.md`, `database-create-migration.md`, `code-format-sql.md`, `database-functions.md`, `declarative-database-schema.md`, `nextjs-supabase-auth.md`, `use-realtime.md`. Not packaged skills — copy into CLAUDE.md / a custom skill | **High** — official, pure markdown (no executable code = minimal attack surface) | Use as raw material; I've already encoded their conventions into the day prompt files |
| 3 | **A custom team skill written by you** in `.claude/skills/` + a **`.bolt/prompt` file** in the Bolt project | No "PRD → Bolt prompt" skill exists publicly (verified gap). Writing your own (with the bundled `skill-creator`) and committing to git is **Anthropic's recommended path for team consistency** | **Highest** — in-house eliminates third-party risk entirely | **Best answer to your actual goal.** The `.bolt/prompt` file is Bolt's native per-project system prompt — the single biggest consistency lever, and it's just a text file |
| 4 | **`anthropics/skills`** — official Anthropic repo (verified live, 178k★) | Relevant entries: `skill-creator` (author your own), `webapp-testing` (drive/test the built app — useful Day 3), `frontend-design` (consistent UI output). Nothing database-specific | **High** — official; example-grade, test before relying | Optional add-ons |
| 5 | **`yoanbernabeu/supabase-pentest-skills`** (verified live) | 24 read-only security-audit skills: RLS testing, leaked-key detection, open-bucket audit. MIT, 69★, recent | **Medium** — small community project; read-only by design but audit before use | Nice-to-have: pre-demo RLS check (Day 3), not for building |
| — | Other community Supabase skills (Nice-Wolf-Studio, etc.) | Stale (1 commit) or redundant with the official repo | **Low** | Skip |

**Adjacent (not a skill):** the official **Supabase MCP server** (github.com/supabase/mcp) gives Claude live access to your actual project — run SQL, apply migrations, read logs. Skills = consistent *conventions*; MCP = consistent *execution*. They combine well, but MCP needs project credentials, so decide deliberately.

## 2. Safety verdict (from Anthropic's official guidance + incident research)

- Anthropic's rule: **"Use Skills only from trusted sources: those you created yourself or obtained from Anthropic."** Skills can bundle executable scripts and (in Claude Code) have full network access; a repo skill's `allowed-tools` frontmatter applies even in untrusted workspaces.
- Marketplace curation is thin: skills.sh has partial after-the-fact scanning (many entries "Pending"); skillsmp.com has none. **Real malware has shipped through agent-skill marketplaces** (Feb 2026 "ClawHavoc": 341 malicious skills on ClawHub delivering the AMOS infostealer; later "SkillCloak" research showed obfuscated skills evade scanners >90% of the time).
- **Practical verdict for your list:** items 1, 2, 4 are official-vendor/official-Anthropic — the trusted category. Item 3 is in-house — safest of all. Item 5 gets a manual read-through of every file before use.
- If you install any third-party skill: read SKILL.md + all bundled scripts, check `allowed-tools` and any `` !`cmd` `` blocks, grep for network calls/eval/base64, prefer pure-markdown skills, pin to a commit SHA, and re-review on every update.

## 3. What was NOT found (gaps → custom skill candidates)

1. **No public "PRD → Bolt starting prompt" skill** — highest-value custom skill for this team. Source material: Bolt's prompting docs + the open-source Bolt system prompts (`stackblitz/bolt.new` → `app/lib/.server/llm/prompts.ts`, `stackblitz-labs/bolt.diy`), which reveal WebContainer constraints (no native binaries, Vite preference) a prompt generator should respect.
2. **No skill encoding Bolt's token-economy rules** (one feature per prompt, discussion mode ≈ 90% cheaper for planning, enhance-prompt, rollback-not-retry, `.bolt/prompt`, `.bolt/ignore`).

Both gaps are covered pragmatically by the **`Prompts-Day*` files now in the day folders** — they ARE the guidelines applied to your PRDs. Promoting them into a `.claude/skills/` skill later is a 30-minute job with `skill-creator`.

## 4. Decision summary for the team

- **Do now (zero risk):** use the day-folder prompt files; create the `.bolt/prompt` file (content provided in `day1/Prompts-Day1-DevC-Auth-and-Shell.md`).
- **Decide (low risk, high value):** install official `supabase/agent-skills`.
- **Optional:** `webapp-testing` + `frontend-design` from `anthropics/skills`; pentest skills for a Day 3 security pass.
- **Avoid:** unvetted marketplace skills — the consistency win doesn't justify the audit burden during a 3-day build.
