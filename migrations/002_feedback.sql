-- yingjideng feedback 数据库迁移脚本
-- 执行: npx wrangler d1 execute yingjideng-db --file=migrations/002_feedback.sql

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_type TEXT NOT NULL,        -- bug, suggestion, content, other
    tool_id TEXT,                       -- 关联工具 ID（可选）
    tool_name TEXT,                     -- 关联工具名称（可选）
    email TEXT,                         -- 用户邮箱（可选）
    content TEXT NOT NULL,              -- 反馈内容
    user_ip TEXT,                       -- 用户 IP
    user_agent TEXT,                    -- 用户 User-Agent
    status TEXT DEFAULT 'pending',      -- pending, resolved, closed
    admin_reply TEXT,                   -- 管理员回复
    replied_at DATETIME,                -- 回复时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tool_id ON feedback(tool_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_ip ON feedback(user_ip);