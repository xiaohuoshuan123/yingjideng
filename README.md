# yingjideng — AI 增强工具导航站

> 传统工具 × AI 增强，一站找到最适合你的效率方案

---

## 项目结构

```
yingjideng-static/
├── index.html              # 首页（主页面）
├── data/
│   └── tools.json          # 所有工具数据（核心数据源）
├── css/
│   ├── style.css           # 主样式
│   └── ai-badges.css       # AI 标签徽章样式
├── js/
│   └── app.js              # 主应用逻辑（渲染 + 筛选）
└── README.md               # 项目说明
```

---

## 功能

| 功能 | 说明 |
|------|------|
| 📋 工具列表 | 按分类展示所有工具，支持卡片式浏览 |
| 🔍 搜索 | 实时搜索工具名称、描述、分类 |
| 🏷️ AI 标签 | 标注 AI 原生 / AI 增强 / 传统工具 |
| 💡 AI 替代 | 传统工具卡片内显示 AI 替代推荐 |
| ⚡ 自动化 | 显示可用的自动化脚本/插件 |
| 📊 筛选 | 按 AI 类型、分类、关键词筛选 |
| 📱 响应式 | 移动端完美适配 |

---

## 数据格式

编辑 `data/tools.json` 添加/修改工具：

```json
{
  "id": "tool-id",
  "name": "工具名称",
  "url": "https://example.com",
  "description": "工具描述",
  "ai_type": "ai-native | ai-enhanced | traditional",
  "ai_alternative": {
    "name": "AI 替代工具名",
    "url": "https://ai-tool.com"
  },
  "automation": {
    "name": "自动化脚本名",
    "url": "https://automation-link.com"
  },
  "is_free": "yes | freemium | paid",
  "icon": "https://icon-url.com/favicon.ico"
}
```

### AI 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `ai-native` | AI 原生工具，核心功能基于 AI | Cursor, Midjourney, ChatGPT |
| `ai-enhanced` | 传统工具集成 AI 功能 | Figma, Canva, Notion |
| `traditional` | 传统工具，无 AI 功能 | VS Code, Photoshop, Trello |

---

## 本地预览

### 方法 1：VS Code Live Server（推荐）

1. 安装 VS Code 扩展 "Live Server"
2. 右键 `index.html` → "Open with Live Server"

### 方法 2：Python 简易服务器

```bash
cd yingjideng-static
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 方法 3：Node.js http-server

```bash
npx http-server yingjideng-static -p 8000
```

---

## 部署到 Cloudflare Pages

### 方案 A：Git 自动部署（推荐）

1. **创建 GitHub 仓库**
   ```bash
   # 在 yingjideng-static 目录执行
   git init
   git add .
   git commit -m "Initial commit: yingjideng AI nav"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/yingjideng-nav.git
   git push -u origin main
   ```

2. **绑定 Cloudflare Pages**
   - 登录 https://pages.cloudflare.com
   - "Connect to Git" → 选择你的仓库
   - 设置项目名称 → "Deploy"

3. **绑定域名**
   - Cloudflare Dashboard → 选择项目 → Settings → Custom domains
   - 添加 `yingjideng.dpdns.org`
   - DNS 已指向 Cloudflare，自动生效

### 方案 B：直接上传

1. 压缩整个 `yingjideng-static` 文件夹为 ZIP
2. Cloudflare Pages → "Create project" → "Upload assets"
3. 上传 ZIP 文件
4. 绑定域名

---

## 添加新工具

1. 打开 `data/tools.json`
2. 找到对应分类的 `tools` 数组
3. 添加新的工具对象（参考上方数据格式）
4. 保存文件
5. Git push → Cloudflare 自动部署

---

## 技术栈

| 技术 | 版本 |
|------|------|
| HTML5 | - |
| CSS3 | - |
| JavaScript | ES6+ |
| Bootstrap | 4.3.1 |
| Font Awesome | 5.15.4 |
| CDN | jsDelivr |

---

## 数据量

- 分类数：20 个
- 工具数：181+ 个
- 文件大小：~50KB（JSON 数据）

---

## 后续扩展

| 功能 | 难度 | 说明 |
|------|------|------|
| 分类详情页 | ⭐ | 每个分类独立页面 |
| 收藏功能 | ⭐⭐ | 本地存储收藏 |
| 提交工具表单 | ⭐⭐ | 用户提交工具审核 |
| 对比功能 | ⭐⭐ | 传统 vs AI 对比视图 |
| 暗黑模式 | ⭐ | CSS 变量切换 |
| 多语言 | ⭐⭐ | i18n 支持 |

---

## License

MIT License
