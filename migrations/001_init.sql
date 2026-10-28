-- yingjideng favorites 数据库迁移脚本
-- 执行: npx wrangler d1 execute yingjideng-favorites --file=migrations/001_init.sql

CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    tool_url TEXT NOT NULL,
    category TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_id ON favorites(tool_id);
