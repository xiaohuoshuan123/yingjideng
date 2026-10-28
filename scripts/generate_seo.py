#!/usr/bin/env python3
"""W4: 生成 SEO 优化文件 - 工具详情页模板 + JSON-LD"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

# 1. 生成工具详情页模板 tool.html
tool_page = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <title>工具详情 — yingjideng AI 增强工具导航站</title>
    <meta name="description" content="在 yingjideng 找到最适合你的 AI 增强效率工具。传统工具 × AI 增强，一站找到最适合的方案。">
    
    <!-- Open Graph / 社交媒体分享 -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yingjideng.dpdns.org/">
    <meta property="og:title" content="yingjideng — AI 增强工具导航站">
    <meta property="og:description" content="收录 300+ AI 增强效率工具，涵盖开发、设计、办公、学习等领域。">
    <meta property="og:image" content="https://yingjideng.dpdns.org/og-image.png">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="yingjideng — AI 增强工具导航站">
    <meta name="twitter:description" content="收录 300+ AI 增强效率工具，涵盖开发、设计、办公、学习等领域。">
    <meta name="twitter:image" content="https://yingjideng.dpdns.org/og-image.png">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "yingjideng",
        "url": "https://yingjideng.dpdns.org/",
        "description": "AI 增强工具导航站，收录 300+ 效率工具",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yingjideng.dpdns.org/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.min.css">
    <link rel="stylesheet" href="css/style.css?v=5">
    <link rel="stylesheet" href="css/ai-badges.css?v=5">
    
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>">
</head>
<body>
    <!-- 顶部导航 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="index.html"><i class="fas fa-robot"></i> yingjideng</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item"><a class="nav-link" href="index.html">首页</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">分类</a>
                        <div class="dropdown-menu" id="category-menu"></div>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="favorites.html"><i class="fas fa-heart"></i> 收藏</a></li>
                </ul>
                <form class="form-inline my-2 my-lg-0" id="search-form">
                    <input class="form-control mr-sm-2" type="search" placeholder="搜索工具..." id="search-input">
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">搜索</button>
                </form>
            </div>
        </div>
    </nav>

    <!-- 工具详情 -->
    <main class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <div id="tool-detail-content">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="sr-only">加载中...</span>
                                </div>
                                <p class="mt-3 text-muted">正在加载工具详情...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <a href="index.html" class="btn btn-outline-secondary"><i class="fas fa-arrow-left"></i> 返回首页</a>
                </div>
            </div>
        </div>
    </main>

    <!-- 页脚 -->
    <footer class="site-footer mt-5">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h5><i class="fas fa-robot"></i> yingjideng</h5>
                    <p class="text-muted small">传统工具 × AI 增强，一站找到最适合你的效率方案</p>
                </div>
                <div class="footer-links">
                    <h6>快速链接</h6>
                    <ul>
                        <li><a href="index.html">首页</a></li>
                        <li><a href="favorites.html">我的收藏</a></li>
                        <li><a href="sitemap.xml">站点地图</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="mb-0">&copy; 2026 yingjideng.dpdns.org | Powered by Cloudflare Pages</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/app.js?v=5"></script>
    <script>
    // 工具详情页逻辑
    document.addEventListener('DOMContentLoaded', async function() {
        const params = new URLSearchParams(window.location.search);
        const toolId = params.get('id');
        
        if (!toolId) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            const response = await fetch('data/tools.json?v=' + Date.now());
            const data = await response.json();
            
            const allTools = data.categories.flatMap(cat => 
                cat.tools.map(tool => ({ ...tool, category: cat.id, category_name: cat.name }))
            );
            
            const tool = allTools.find(t => t.id === toolId);
            if (!tool) {
                document.getElementById('tool-detail-content').innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h4>工具未找到</h4>
                        <p class="text-muted">该工具不存在或已被移除</p>
                    </div>
                `;
                return;
            }
            
            // 渲染工具详情
            const aiLabels = { 'ai-native': 'AI 原生', 'ai-enhanced': 'AI 增强', 'traditional': '传统' };
            const priceLabels = { 'yes': '免费', 'freemium': '免费增值', 'paid': '付费' };
            
            let html = `
                <div class="text-center mb-4">
                    <div style="font-size: 4rem;">${tool.icon || '🔧'}</div>
                    <h2 class="mt-3">${tool.name}</h2>
                    <p class="text-muted">${tool.category_name}</p>
                    <div class="mt-2">
                        <span class="badge badge-${aiLabels[tool.ai_type] === 'AI 原生' ? 'danger' : aiLabels[tool.ai_type] === 'AI 增强' ? 'primary' : 'secondary'}">
                            ${aiLabels[tool.ai_type]}
                        </span>
                        <span class="badge badge-${priceLabels[tool.is_free] === '免费' ? 'success' : priceLabels[tool.is_free] === '免费增值' ? 'info' : 'warning'}">
                            ${priceLabels[tool.is_free]}
                        </span>
                    </div>
                </div>
                
                <h5>描述</h5>
                <p>${tool.description}</p>
                
                <div class="mt-4">
                    <a href="${tool.url}" target="_blank" class="btn btn-success btn-lg">
                        <i class="fas fa-external-link-alt"></i> 访问 ${tool.name}
                    </a>
                </div>
            `;
            
            if (tool.ai_alternative) {
                html += `
                    <div class="mt-4 p-3 bg-light rounded">
                        <h6><i class="fas fa-lightbulb text-warning"></i> AI 替代推荐</h6>
                        <p><a href="${tool.ai_alternative.url}" target="_blank">${tool.ai_alternative.name}</a></p>
                    </div>
                `;
            }
            
            if (tool.automation) {
                html += `
                    <div class="mt-4 p-3 bg-light rounded">
                        <h6><i class="fas fa-bolt text-info"></i> 自动化方案</h6>
                        <p><a href="${tool.automation.url}" target="_blank">${tool.automation.name}</a></p>
                    </div>
                `;
            }
            
            document.getElementById('tool-detail-content').innerHTML = html;
            
            // 更新 OG 标签
            document.querySelector('[property="og:title"]').setAttribute('content', `${tool.name} — yingjideng`);
            document.querySelector('[property="og:description"]').setAttribute('content', tool.description);
            
        } catch (error) {
            console.error('加载失败:', error);
            document.getElementById('tool-detail-content').innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4>加载失败</h4>
                    <p class="text-muted">请刷新页面重试</p>
                </div>
            `;
        }
    });
    </script>
</body>
</html>
'''

with open('tool.html', 'w', encoding='utf-8') as f:
    f.write(tool_page)

print("✅ tool.html 工具详情页模板已生成")

# 2. 生成 OG 图片占位符说明
og_note = """# OG Image 说明
# yingjideng 需要一张 og-image.png 用于社交媒体分享

# 推荐尺寸: 1200x630px
# 推荐内容: 
#   - Logo/品牌名: yingjideng
#   - Slogan: 传统工具 × AI 增强
#   - 副标题: 300+ AI 增强效率工具导航站

# 可以使用以下工具生成:
#   - https://og-image.vercel.app/
#   - https://camo.githubusercontent.com/
#   - Canva: https://canva.com

# 临时方案：先使用纯色背景 + 文字
"""

with open('OG-IMAGE-NOTE.md', 'w', encoding='utf-8') as f:
    f.write(og_note)

print("✅ OG-IMAGE-NOTE.md 已生成（需要手动创建 og-image.png）")