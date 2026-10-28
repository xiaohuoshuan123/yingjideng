# yingjideng W4 阶段任务清单

## W4 目标：SEO 优化 + 性能优化 + PWA 支持

### 1. SEO 优化（高优先级） ✅
- [x] 生成 sitemap.xml（自动从 tools.json 生成所有工具页面链接）— 323 个 URL
- [x] 生成 robots.txt（允许所有搜索引擎抓取）
- [x] 优化每个页面的 meta description（含关键词）
- [x] 添加 Open Graph / Twitter Card 社交分享标签
- [x] 添加 structured data (JSON-LD) 用于搜索引擎富片段
- [x] 生成工具详情页模板 tool.html
- [x] 生成 OG 图片 og-image.svg（1200x630）

### 2. 性能优化（中优先级） ✅
- [x] 图片懒加载（Intersection Observer API）— URL 图标自动懒加载
- [x] 工具卡片虚拟滚动（超过 20 个时只渲染可视区域）— VirtualScroll 类
- [x] CSS/JS 版本控制（v=6）
- [x] 预加载关键资源（prefetch 数据文件和 CSS）
- [ ] CSS/JS 压缩（构建时处理）— 可选
- [ ] 添加 Preload/Prefetch 关键资源 — 已实现

### 3. PWA 支持（中优先级） ✅
- [x] 添加 manifest.json
- [x] 创建 service-worker.js（离线缓存）
- [x] 添加 PWA 安装提示横幅
- [x] 所有 HTML 页面添加 manifest 链接和 theme-color

### 4. 其他（低优先级） ⏳
- [ ] 用户反馈/提交工具表单
- [ ] 工具详情页独立页面（已完成 tool.html）
- [ ] 暗黑模式切换

---

## V5 部署包
- 文件: `/home/ubuntu/agency-agents-zh/yingjideng-v5.zip`
- 大小: 33.3 KB
- 内容: 18 个文件（不含 scripts/ 和 data/tools.json）