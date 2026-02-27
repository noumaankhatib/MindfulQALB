# Supabase MCP setup

This project works with [Supabase MCP](https://supabase.com/mcp) so you can run SQL, get project URL/keys, and manage migrations from Cursor.

## Connect Supabase MCP

1. In Cursor: **Settings → MCP** (or add a project-level `.cursor/mcp.json`).
2. Add the Supabase MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

3. Authenticate with your Supabase account when prompted and select the organization/project.
4. Restart Cursor if needed.

## Use with this repo

- **Run full setup:** Use the MCP **execute_sql** tool with the contents of `docs/supabase-full-setup.sql` (or run it in chunks from `docs/SUPABASE_SETUP.md`).
- **Env vars:** Use **get_project_url** and **get_publishable_keys** to get `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for `.env` and Vercel.
- **Types:** Use **generate_typescript_types** to regenerate `src/types/database.ts` after schema changes.
- **Migrations:** Use **apply_migration** / **list_migrations** for schema versioning.

See [Supabase MCP docs](https://supabase.com/mcp) for the full list of tools.
