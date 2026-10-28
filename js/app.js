/**
 * yingjideng — 主应用逻辑（V6 性能优化版）
 * 新增：虚拟滚动、图片懒加载、预加载提示
 * 功能：加载数据、渲染工具、筛选、搜索、收藏、分类页
 */

// ============================================
// 全局状态
// ============================================

let allTools = [];
let currentTools = [];
let currentCategory = 'all';
let currentAiType = 'all';
let currentSearch = '';
let currentSort = 'default';
let isCategoryPage = false;

// 搜索历史（localStorage）
const SEARCH_HISTORY_KEY = 'yingjideng_search_history';
const MAX_SEARCH_HISTORY = 10;

// 虚拟滚动状态
let virtualScroll = null;
const VIRTUAL_SCROLL_CONFIG = {
    itemHeight: 120,      // 每个卡片高度 (px)
    bufferSize: 4,        // 缓冲区卡片数（上下各）
    minRenderCount: 20    // 最少渲染卡片数（小屏）
};

// 将全局状态挂载到 window，供其他脚本（如 favorites.js）访问
window.yingjideng = window.yingjideng || {};
Object.defineProperty(window.yingjideng, 'allTools', {
    get: function() { return allTools; },
    enumerable: true,
    configurable: true
});

// ============================================
// Emoji 图标映射（每个工具一个 emoji）
// ============================================

const EMOJI_ICONS = {
    // 开发工具
    'cursor': '💻', 'vscode': '🔧', 'github-copilot': '🤖', 'replit': '🌐',
    'stackblitz': '⚡', 'codepen': '🎨', 'gitpod': '🐳', 'windsurf': '🌊',
    'codeium': '🎯', 'tabnine': '🐕',
    
    // 设计工具
    'figma': '🎨', 'canva': '🖌️', 'adobe-firefly': '🔥', 'midjourney': '🎭',
    'dall-e': '🖼️', 'stable-diffusion': '🧬', 'photoshop': '📷', 'sketch': '✏️',
    'remove-bg': '✂️', 'unsplash': '📸',
    
    // 办公工具
    'chatgpt': '💬', 'claude': '📝', 'notion-ai': '📓', 'obsidian': '🗿',
    'grammarly': '✍️', 'quillbot': '🔄', 'deepl': '🌐', 'trello': '📋',
    'evernote': '📔', 'feishu': '🚀',
    
    // 视频工具
    'runway': '🎬', 'pika': '🐧', 'sora': '🌪️', 'capcut': '✂️',
    'premiere-pro': '🎥', 'descript': '📝', 'heygen': '🎭', 'elevenlabs': '🔊',
    
    // 学习工具
    'coursera': '🎓', 'khan-academy': '📚', 'brilliant': '💡', 'duolingo': '🦉',
    'anki': '🃏', 'z-library': '📖', 'perplexity': '🔍', 'kimi': '🌙',
    
    // 云服务
    'aws': '☁️', 'azure': '🔷', 'gcp': '🔶', 'cloudflare-pages': '⚡',
    'vercel': '▲', 'netlify': '🔷', 'supabase': '🟢', 'railway': '🚂',
    
    // 效率工具
    'zapier': '⚡', 'n8n': '🔗', 'ifttt': '🔀', 'todoist': '✅',
    'dropbox': '📦', 'google-drive': '📁', 'one-drive': '☁️',
    
    // 数据工具
    'airtable': '📊', 'notion-db': '🗂️', 'tableau': '📈', 'power-bi': '📊',
    'metabase': '📉', 'google-analytics': '📊', 'mixpanel': '📈', 'amplitude': '📉',
    
    // 新增工具
    'claude-code': '📜', 'gemma': '💎', 'mistral': '🌬️', 'llama': '🦙',
    'ollama': '🦙', 'lm-studio': '🖥️', 'text-generation-webui': '⌨️',
    'huggingface': '🤗', 'cohere': '🔗', 'anthropic': '🏛️',
    'openrouter': '🛣️', 'groq': '⚡', 'together': '🤝',
    
    'perplexity-ai': '🔍', 'you-com': '🔎', 'phind': '🔧',
    'search15': '🔍', 'brave-search': '🦁',
    
    'tome': '📖', 'gamma': '🌟', 'slidesgo': '📊',
    'beautiful.ai': '🎨', 'canva-presentations': '🖼️',
    
    'notion-calendar': '📅', 'calendly': '📆', 'clockwise': '⏰',
    'motion': '🎬', 'reclaim': '🔄',
    
    'fireflies': '🪲', 'grain': '🌾', 'otter': '🦦',
    'fathom': '🌊', 'tl;dv': '⏩',
    
    'superhuman': '🚀', 'hey': '👋', 'spark': '⚡',
    'gmail': '📧', 'outlook': '💌',
    
    'slack': '💬', 'discord': '🎮', 'telegram': '✈️',
    'wechat': '💬', 'whatsapp': '📱',
    
    'zoom': '📹', 'teams': '💼', 'meet': '📹',
    'jitsi': '🎥', 'whereby': '🌍',
    
    'twitch': '🎮', 'youtube': '▶️', 'vimeo': '🎬',
    'dailymotion': '📺', 'bilibili': '📺',
    
    'reddit': '👽', 'twitter': '🐦', 'linkedin': '💼',
    'facebook': '📘', 'instagram': '📷',
    
    'pinterest': '📌', 'tiktok': '🎵', 'snapchat': '👻',
    'threads': '🧵', 'bluesky': '🦋',
    
    'github': '🐙', 'gitlab': '🦊', 'bitbucket': '🐧',
    'sourceforge': '📦', 'codeberg': '🏔️',
    
    'npm': '📦', 'pypi': '🐍', 'maven': '📚',
    'cargo': '📦', 'composer': '🎼',
    
    'docker': '🐳', 'kubernetes': '☸️', 'terraform': '🏗️',
    'ansible': '⚙️', 'vagrant': '📦',
    
    'jupyter': '📓', 'colab': '🎓', 'kaggle': '🏆',
    'streamlit': '🌊', 'gradio': '🎛️',
    
    'postman': '📨', 'insomnia': '🌙', 'httpie': '🦁',
    'curl': '🌀', 'wget': '⬇️',
    
    'nginx': '🟢', 'apache': '🪶', 'caddy': '🚒',
    'traefik': '🚢', 'haproxy': '⚖️',
    
    'redis': '🔴', 'mongodb': '🍃', 'elasticsearch': '🔍',
    'kafka': '🦅', 'rabbitmq': '🐰',
    
    'jenkins': '🔵', 'gitlab-ci': '🔷', 'github-actions': '⚡',
    'travis': '🟢', 'circleci': '⭕',
    
    'datadog': '📊', 'new-relic': '🆕', 'sentry': '🔴',
    'prometheus': '📈', 'grafana': '📉',
    
    'terraform-cloud': '🏗️', 'pulumi': '🌀', 'crossplane': '🔀',
    
    // AI 模型/API
    'openai': '🤖', 'anthropic-claude': '🟠', 'google-gemini': '🌈',
    'meta-llama': '🦙', 'mistral-ai': '🌬️', 'cohere': '🔗',
    'deepseek': '🔍', 'qwen': '🌊', 'kimi': '🌙',
    
    // AI 写作/营销
    'jasper': '🎨', 'copy-ai': '📋', 'surfer': '🏄', 'frase': '🦒',
    'clearscope': '🔍', 'marketmuse': '🎯', 'brightedge': '💡',
    
    // AI 搜索
    'ahrefs': '🔗', 'semrush': '📈', 'moz': '🦊',
    'screaming-frog': '🦎', 'ubersuggest': '🔍',
    
    // 用户行为分析
    'hotjar': '🔥', 'crazy-egg': '🥚', 'mouseflow': '🐭',
    'fullstory': '📹', 'inspectlet': '👀',
    
    // A/B 测试
    'optimizely': '🎯', 'vwo': '🅰️🅱️', 'ab-testing': '🧪',
    'google-optimize': '🔧', 'unbounce': '🚀',
    
    // 设计系统
    'webflow': '🌊', 'framer': '🖼️', 'webflow-studio': '🎨',
    'readymag': '📰', 'tilda': '🏗️',
    
    // 项目管理
    'airtable-base': '📊', 'smartsheet': '📋', 'monday': '📅',
    'asana': '🎯', 'clickup': '✅',
    
    // 开发协作
    'linear': '📐', 'jira': '🔷', 'shortcut': '⚡',
    'height': '📏', 'notion-projects': '📓',
    
    // 知识库
    'roam': '🔗', 'obsidian-canvas': '🗺️', 'logseq': '📝',
    'tana': '🌳', 'anytype': '🔗',
    
    // 笔记
    'bear': '🐻', 'upnote': '📓', 'simplenote': '📝',
    'standard-notes': '🔒', 'joplin': '🎺',
    
    // 会议 AI
    'zoom-ai': '📹', 'teams-copilot': '💼', 'meet-ai': '📹',
    'fireflies-ai': '🪲', 'grain-ai': '🌾',
    
    // 本地 AI
    'claude-desktop': '📝', 'chatgpt-desktop': '💬', 'perplexity-app': '🔍',
    'kimi-app': '🌙', 'groq-app': '⚡',
    
    // 编辑器
    'windsurf-editor': '🌊', 'cursor-pro': '💻', 'codeium-enterprise': '🎯',
    'tabnine-pro': '🐕', 'copilot-enterprise': '🤖',
    
    // AI 编程
    'github-copilot-chat': '💬', 'code-whisperer': '🤫', 'code-gee-x': '🧩',
    'amazon-q': '❓', 'ibm-watsonx': '🔵',
    
    // 大模型
    'mistral-large': '🌬️', 'mixtral': '❄️', 'codestral': '🔧',
    'pixtral': '🖼️', 'mistral-small': '🌬️',
    
    'gemma-2': '💎', 'gemma-3': '💎', 'llama-3': '🦙',
    'llama-4': '🦙', 'qwen': '🌊',
    
    'deepseek': '🔍', 'yi': '🇨🇳', 'glm': '🔷',
    'internlm': '🌊', 'baichuan': '🌊',
    
    'wenxin': '💭', 'tongyi': '🌈', 'kimi-chat': '🌙',
    '元宝': '💰', '豆包': '🫘',
    
    // API 平台
    'openai-api': '🔌', 'anthropic-api': '🔌', 'google-ai': '🔌',
    'azure-openai': '🔌', 'aws-bedrock': '🔌',
    
    // AI 框架
    'langchain': '🔗', 'llama-index': '📚', 'haystack': '🐕',
    'crewai': '👥', 'autogen': '🤖',
    
    // AI 工作流
    'flowise': '🌊', 'langflow': '🌊', 'dify': '💡',
    'coze': '🎈', 'dify-cloud': '☁️',
    
    // AI 自动化
    'n8n-ai': '🔗', 'zapier-ai': '⚡', 'make': '🔀',
    'workato': '🍠', 'tray': '📦',
    
    // 云数据库
    'supabase-ai': '🟢', 'neon': '💧', 'planetscale': '🌍',
    'vercel-postgres': '▲', 'railway-db': '🚂',
    
    // Cloudflare
    'cloudflare-workers': '⚡', 'cloudflare-d1': '💾', 'cloudflare-kv': '🔑',
    'cloudflare-r2': '📦', 'cloudflare-images': '🖼️',
    
    // 云厂商
    'vercel-kv': '▲', 'vercel-blob': '📦', 'vercel-edge': '⚡',
    'netlify-functions': '🔷', 'render': '🎨',
    
    'fly-io': '🪂', ' Render': '🎨', ' Railway': '🚂',
    ' DigitalOcean': '💧', ' Heroku': '🌳',
    
    'aws-lambda': '⚡', 'azure-functions': '🔷', 'gcp-cloud-functions': '🔶',
    'alibaba-fc': '🌐', 'tencent-scfc': '🔵',
};

// ============================================
// AI 类型和价格标签
// ============================================

const AI_TYPE_LABELS = {
    'ai-native': { label: 'AI 原生', class: 'ai-native' },
    'ai-enhanced': { label: 'AI 增强', class: 'ai-enhanced' },
    'traditional': { label: '传统', class: 'traditional' }
};

const PRICE_LABELS = {
    'yes': { label: '免费', class: 'free' },
    'freemium': { label: '免费增值', class: 'freemium' },
    'paid': { label: '付费', class: 'paid' }
};

// ============================================
// 虚拟滚动类
// ============================================

class VirtualScroll {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.config = { ...VIRTUAL_SCROLL_CONFIG, ...options };
        this.items = [];
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.observer = null;
        
        this.init();
    }
    
    init() {
        // 创建虚拟滚动容器
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtual-scroll-wrapper';
        this.wrapper.style.cssText = `
            position: relative;
            overflow-y: auto;
            height: 100%;
        `;
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        `;
        
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.appendChild(this.wrapper);
        this.wrapper.appendChild(this.content);
        
        // 监听滚动
        this.wrapper.addEventListener('scroll', () => this.onScroll());
        
        // 监听容器大小变化
        this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
        this.resizeObserver.observe(this.container);
        
        // 初始化尺寸
        this.updateDimensions();
    }
    
    updateDimensions() {
        this.containerHeight = this.container.clientHeight;
        this.render();
    }
    
    setItems(items) {
        this.items = items;
        this.render();
    }
    
    onScroll() {
        this.scrollTop = this.wrapper.scrollTop;
        this.render();
    }
    
    render() {
        if (!this.items.length) {
            this.content.innerHTML = '';
            this.content.style.height = '0px';
            return;
        }
        
        const { itemHeight, bufferSize, minRenderCount } = this.config;
        const totalHeight = this.items.length * itemHeight;
        this.content.style.height = totalHeight + 'px';
        
        // 计算可见区域
        const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - bufferSize);
        const visibleCount = Math.ceil(this.containerHeight / itemHeight);
        const endIndex = Math.min(this.items.length, startIndex + visibleCount + bufferSize * 2);
        
        // 确保最少渲染数量（小屏）
        const renderCount = Math.max(endIndex - startIndex, minRenderCount);
        
        // 渲染可见项
        let html = '';
        for (let i = startIndex; i < endIndex; i++) {
            const tool = this.items[i];
            const top = i * itemHeight;
            html += this.renderItem(tool, top);
        }
        
        this.content.innerHTML = html;
        
        // 更新结果统计
        this.updateCount();
    }
    
    renderItem(tool, top) {
        const aiInfo = AI_TYPE_LABELS[tool.ai_type];
        const priceInfo = tool.is_free ? PRICE_LABELS[tool.is_free] : null;
        const isFav = typeof isFavorite === 'function' && isFavorite(tool.id);
        
        const aiBadge = `<span class="ai-badge ${aiInfo.class}">${aiInfo.label}</span>`;
        const priceBadge = priceInfo ? `<span class="tool-price ${priceInfo.class}">${priceInfo.label}</span>` : '';
        const favoriteBtn = typeof toggleFavorite === 'function' 
            ? `<button class="favorite-btn ${isFav ? 'is-favorite' : ''}" data-tool-id="${tool.id}" onclick="event.stopPropagation(); toggleFavorite('${tool.id}')">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
               </button>`
            : '';
        
        let aiRecommend = '';
        if (tool.ai_type === 'traditional' && tool.ai_alternative) {
            aiRecommend = `
                <div class="ai-recommend-box">
                    <span class="label">💡 AI 替代:</span>
                    <a href="${tool.ai_alternative.url}" target="_blank">${tool.ai_alternative.name}</a>
                </div>
            `;
        }
        
        let automation = '';
        if (tool.automation) {
            automation = `
                <div class="automation-box">
                    <span class="label">⚡ 自动化:</span>
                    <a href="${tool.automation.url}" target="_blank">${tool.automation.name}</a>
                </div>
            `;
        }
        
        // 使用高亮文本（虚拟滚动也支持搜索高亮）
        const highlightedName = highlightText(tool.name, currentSearch);
        const highlightedDesc = highlightText(tool.description, currentSearch);
        
        return `
            <div class="tool-card virtual-item" 
                 data-tool-id="${tool.id}" 
                 style="position: absolute; top: ${top}px; left: 0; right: 0; height: ${this.config.itemHeight}px;"
                 onclick="showToolDetail('${tool.id}')">
                ${favoriteBtn}
                <div class="tool-card-header">
                    <div class="tool-icon">${getIconHtml(tool.icon, tool.id)}</div>
                    <div class="tool-title-with-badge">
                        <span class="tool-title">${highlightedName}</span>
                        ${aiBadge}
                        ${priceBadge}
                    </div>
                </div>
                <div class="tool-card-body">
                    <p class="tool-description">${highlightedDesc}</p>
                    ${aiRecommend}
                    ${automation}
                </div>
            </div>
        `;
    }
    
    updateCount() {
        const countEl = document.getElementById('result-count');
        if (!countEl) return;
        
        const total = allTools.length;
        const shown = this.items.length;
        const visible = Math.min(this.items.length, 
            Math.ceil(this.containerHeight / this.config.itemHeight) + this.config.bufferSize * 2);
        
        if (shown === total) {
            countEl.textContent = `共 ${total} 个工具`;
        } else {
            countEl.textContent = `显示 ${shown} / ${total} 个工具（可见 ${visible} 个）`;
        }
    }
    
    destroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.wrapper) this.wrapper.remove();
    }
}

// ============================================
// 图片懒加载（Intersection Observer）
// ============================================

function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',  // 提前 50px 加载
        threshold: 0
    });
    
    // 观察所有懒加载图片
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// 预加载关键资源
// ============================================

function preloadCriticalResources() {
    // 预加载数据文件（如果还没加载）
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'data/tools.json';
    link.as = 'fetch';
    document.head.appendChild(link);
    
    // 预加载 CSS
    ['css/style.css', 'css/ai-badges.css', 'css/favorites.css'].forEach(css => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = css + '?v=6';
        document.head.appendChild(link);
    });
    
    console.log('[Preload] 关键资源已预加载');
}

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // 预加载关键资源
    preloadCriticalResources();
    
    // 检测是否为分类页（Cloudflare Pages 自动去掉 .html 后缀）
    const path = window.location.pathname;
    isCategoryPage = path.includes('category.html') || path === '/category' || 
                     path.endsWith('/category') || path.startsWith('/category/');
    
    // 从 URL 读取筛选参数（在加载数据前读取，加载后应用）
    readURLParams();
    
    // 初始化 popstate 监听（浏览器前进/后退）
    initPopStateHandler();
    
    // 缓存破坏：添加时间戳确保加载最新数据
    const cacheBuster = '?v=' + Date.now();
    
    try {
        const response = await fetch('data/tools.json' + cacheBuster);
        if (!response.ok) throw new Error('加载数据失败');
        const data = await response.json();
        
        allTools = data.categories.flatMap(cat => 
            cat.tools.map(tool => ({ ...tool, category: cat.id, category_name: cat.name }))
        );
        
        // 初始化渲染
        currentTools = [...allTools];
        
        // 启用虚拟滚动（如果卡片数 > 20）
        if (currentTools.length > VIRTUAL_SCROLL_CONFIG.minRenderCount) {
            const grid = document.getElementById('tools-grid');
            if (grid) {
                // 替换为虚拟滚动容器
                grid.id = 'tools-grid-original';
                grid.style.display = 'none';
                
                const virtualContainer = document.createElement('div');
                virtualContainer.id = 'tools-grid';
                virtualContainer.style.cssText = 'height: calc(100vh - 280px); min-height: 400px;';
                grid.parentNode.insertBefore(virtualContainer, grid.nextSibling);
                
                virtualScroll = new VirtualScroll('tools-grid');
                virtualScroll.setItems(currentTools);
                
                console.log(`🚀 启用虚拟滚动: ${currentTools.length} 个工具`);
            }
        } else {
            renderTools();
        }
        
        renderCategoryMenu(data.categories);
        renderCategoryFilterButtons(data.categories);
        
        // 应用从 URL 读取的筛选参数
        applyFilters();
        
        // 更新筛选按钮状态
        updateFilterButtons();
        
        // 初始化图片懒加载
        initLazyLoading();
        
        console.log(`✅ 加载完成：${allTools.length} 个工具, 当前分类: ${currentCategory}`);
        
        // 通知其他页面（如收藏页）数据已就绪
        if (window.yingjideng) {
            window.yingjideng.dataReady = true;
        }
        // 如果收藏页面在等待，主动触发渲染
        if (typeof renderFavorites === 'function') {
            // 只在收藏页面调用（通过 URL 判断）
            if (window.location.pathname.includes('favorites') || window.location.pathname.includes('favorites.html')) {
                setTimeout(() => renderFavorites(), 50);
            }
        }
    } catch (error) {
        console.error('❌ 加载失败:', error);
        const grid = document.getElementById('tools-grid') || document.getElementById('tools-grid-original');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4>数据加载失败</h4>
                    <p class="text-muted">请检查 data/tools.json 文件是否存在</p>
                </div>
            `;
        }
    }
    
    bindEvents();
});

// ============================================
// 无结果建议
// ============================================

/**
 * 无结果时显示建议
 */
function showNoResultsSuggestions() {
    const noResults = document.getElementById('no-results');
    if (!noResults) return;
    
    const suggestions = [];
    
    // 1. 推荐热门分类
    const categoryCounts = {};
    allTools.forEach(t => {
        if (currentAiType === 'all' || t.ai_type === currentAiType) {
            categoryCounts[t.category_name] = (categoryCounts[t.category_name] || 0) + 1;
        }
    });
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
    
    if (topCategories.length > 0) {
        suggestions.push(`<strong>热门分类：</strong>${topCategories.join('、')}`);
    }
    
    // 2. 推荐相似搜索（基于当前搜索词）
    if (currentSearch && currentSearch.length >= 2) {
        const similarTools = allTools.filter(t => 
            (t.name.includes(currentSearch) || t.description.includes(currentSearch)) &&
            (currentCategory === 'all' || t.category === currentCategory) &&
            (currentAiType === 'all' || t.ai_type === currentAiType)
        );
        if (similarTools.length > 0) {
            suggestions.push(`<strong>相似工具：</strong>${similarTools.slice(0, 3).map(t => t.name).join('、')}`);
        }
    }
    
    // 3. 清除筛选建议
    if (currentCategory !== 'all' || currentAiType !== 'all') {
        suggestions.push(`<a href="javascript:clearFilters()">清除当前筛选</a>`);
    }
    
    noResults.innerHTML = `
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h4>未找到匹配的工具</h4>
        <p class="text-muted">搜索 "${escapeHtml(currentSearch)}" 没有找到结果</p>
        ${suggestions.length > 0 ? `<div class="mt-3 text-left" style="max-width:400px;margin:0 auto;">${suggestions.map(s => `<p>${s}</p>`).join('')}</div>` : ''}
        <p class="text-muted mt-2">尝试调整筛选条件或使用其他关键词</p>
    `;
}

/**
 * 清除所有筛选
 */
function clearFilters() {
    currentCategory = 'all';
    currentAiType = 'all';
    currentSearch = '';
    currentSort = 'default';
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    updateFilterButtons();
    applyFilters();
}

// ============================================
// 更新筛选按钮状态
// ============================================

/**
 * 更新筛选按钮的 active 状态
 */
function updateFilterButtons() {
    // AI 类型按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        btn.classList.toggle('active', filter === currentAiType);
    });
    
    // 分类按钮（筛选区域）
    document.querySelectorAll('#category-buttons-container .category-btn, .category-btn[data-category="all"]').forEach(btn => {
        const cat = btn.dataset.category;
        btn.classList.toggle('active', cat === currentCategory);
    });
    
    // 排序按钮
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const sort = btn.dataset.sort;
        btn.classList.toggle('active', sort === currentSort);
    });
}

// ============================================
// 事件绑定
// ============================================
// 事件绑定
// ============================================

function bindEvents() {
    // AI 类型筛选
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentAiType = this.dataset.filter;
            // 当 AI 类型选"全部"时，同时重置分类为"全部"
            if (currentAiType === 'all') {
                currentCategory = 'all';
            }
            applyFilters();
        });
    });
    
    // 分类筛选 - 使用事件委托（避免重复绑定）
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.addEventListener('click', function(e) {
            const btn = e.target.closest('.category-btn[data-category]');
            if (btn) {
                e.preventDefault();
                currentCategory = btn.dataset.category;
                applyFilters();
            }
        });
    }
    
    // 排序
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentSort = this.dataset.sort;
            applyFilters();
        });
    });
    
    // 搜索表单提交
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        currentSearch = document.getElementById('search-input').value.trim();
        // 添加到搜索历史
        addSearchToHistory(currentSearch);
        // 更新搜索建议
        updateSearchSuggestions();
        // 记录搜索（analytics）
        if (typeof recordSearch === 'function') {
            setTimeout(() => recordSearch(currentSearch, currentTools.length), 100);
        }
        applyFilters();
    });
    
    // 搜索输入实时搜索（防抖）
    document.getElementById('search-input').addEventListener('input', function() {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            currentSearch = this.value.trim();
            // 更新搜索建议
            updateSearchSuggestions();
            // 记录搜索（analytics）
            if (typeof recordSearch === 'function') {
                setTimeout(() => recordSearch(currentSearch, currentTools.length), 100);
            }
            applyFilters();
        }, 300);  // 防抖 300ms
    });
    
    // 清除搜索按钮
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearFilters();
        });
    }
    
    // 更新搜索建议（初始加载）
    updateSearchSuggestions();
}

// ============================================
// 搜索建议（datalist）
// ============================================

/**
 * 更新搜索建议列表
 */
function updateSearchSuggestions() {
    const datalist = document.getElementById('search-suggestions');
    const clearBtn = document.getElementById('clear-search-btn');
    if (!datalist) return;
    
    // 显示/隐藏清除按钮
    if (clearBtn) {
        clearBtn.style.display = (currentSearch || currentCategory !== 'all' || currentAiType !== 'all' || currentSort !== 'default') ? 'block' : 'none';
    }
    
    // 收集所有工具名称和描述作为建议
    const suggestions = new Set();
    
    // 1. 添加搜索历史
    getSearchHistory().forEach(q => suggestions.add(q));
    
    // 2. 添加热门工具名称（匹配当前搜索前缀）
    const prefix = currentSearch ? currentSearch.toLowerCase() : '';
    const count = currentSearch ? 5 : 10;  // 有搜索词时少一些，否则多一些
    
    allTools.forEach(tool => {
        if (!prefix || tool.name.toLowerCase().includes(prefix) || 
            tool.description.toLowerCase().includes(prefix)) {
            suggestions.add(tool.name);
        }
    });
    
    // 3. 添加热门分类名
    const categoryCounts = {};
    allTools.forEach(t => {
        categoryCounts[t.category_name] = (categoryCounts[t.category_name] || 0) + 1;
    });
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name]) => suggestions.add(name));
    
    // 渲染 datalist
    datalist.innerHTML = Array.from(suggestions).slice(0, count).map(s => 
        `<option value="${escapeHtml(s)}"></option>`
    ).join('');
}

// 更新分类菜单选中状态
function updateCategoryMenuActive(catId) {
    // 更新导航栏下拉菜单
    document.querySelectorAll('#category-menu .dropdown-item').forEach(link => {
        const linkCatId = new URL(link.href, window.location.origin).searchParams.get('category') || 'all';
        if (linkCatId === catId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 更新筛选区域的分类按钮
    document.querySelectorAll('#category-buttons-container .category-btn, .category-btn[data-category="all"]').forEach(btn => {
        if (btn.dataset.category === catId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ============================================
// URL 同步（筛选状态持久化）
// ============================================

/**
 * 从 URL 读取筛选参数并应用
 */
function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get('category');
    const aiType = params.get('ai-type');
    const searchQ = params.get('q');
    const sort = params.get('sort');
    
    if (catId && catId !== 'all') {
        currentCategory = catId;
    }
    if (aiType && ['all', 'ai-native', 'ai-enhanced', 'traditional'].includes(aiType)) {
        currentAiType = aiType;
    }
    if (searchQ) {
        currentSearch = searchQ;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = searchQ;
    }
    if (sort && ['default', 'name', 'free'].includes(sort)) {
        currentSort = sort;
    }
}

/**
 * 将当前筛选状态同步到 URL
 */
function syncURL() {
    const url = new URL(window.location);
    const hasParams = currentCategory !== 'all' || currentAiType !== 'all' || currentSearch || currentSort !== 'default';
    
    if (hasParams) {
        if (currentCategory !== 'all') url.searchParams.set('category', currentCategory);
        else url.searchParams.delete('category');
        
        if (currentAiType !== 'all') url.searchParams.set('ai-type', currentAiType);
        else url.searchParams.delete('ai-type');
        
        if (currentSearch) url.searchParams.set('q', currentSearch);
        else url.searchParams.delete('q');
        
        if (currentSort !== 'default') url.searchParams.set('sort', currentSort);
        else url.searchParams.delete('sort');
    } else {
        // 无筛选时清除所有参数
        url.search = '';
    }
    
    // 使用 pushState 但不触发页面刷新
    window.history.pushState({}, '', url);
}

/**
 * 监听浏览器前进/后退
 */
function initPopStateHandler() {
    window.addEventListener('popstate', function() {
        readURLParams();
        applyFilters();
        updateFilterButtons();
    });
}

// ============================================
// 搜索历史管理
// ============================================

/**
 * 获取搜索历史
 */
function getSearchHistory() {
    try {
        const data = localStorage.getItem(SEARCH_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * 添加搜索到历史
 */
function addSearchToHistory(query) {
    if (!query.trim()) return;
    const history = getSearchHistory();
    // 移除重复项
    const idx = history.indexOf(query);
    if (idx > -1) history.splice(idx, 1);
    // 添加到开头
    history.unshift(query);
    // 限制数量
    if (history.length > MAX_SEARCH_HISTORY) history.pop();
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

/**
 * 清除搜索历史
 */
function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
}

// ============================================
// 高亮匹配文本
// ============================================

/**
 * 在文本中高亮匹配关键词
 */
function highlightText(text, query) {
    if (!query || !text) return escapeHtml(text);
    
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    
    // 按关键词分割（支持多词搜索）
    const keywords = escapedQuery.split(/\s+/).filter(k => k.length > 0);
    if (keywords.length === 0) return escapedText;
    
    let result = escapedText;
    // 对每个关键词进行高亮
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
    });
    
    return result;
}

// ============================================
// 应用筛选
// ============================================

function applyFilters() {
    currentTools = allTools.filter(tool => {
        // 分类筛选
        if (currentCategory !== 'all' && tool.category !== currentCategory) return false;
        
        // AI 类型筛选
        if (currentAiType !== 'all' && tool.ai_type !== currentAiType) return false;
        
        // 搜索筛选
        if (currentSearch && !matchesSearch(tool, currentSearch)) return false;
        
        return true;
    });
    
    // 排序
    if (currentSort !== 'default') {
        currentTools.sort((a, b) => {
            if (currentSort === 'name') {
                return a.name.localeCompare(b.name, 'zh-CN');
            } else if (currentSort === 'free') {
                const order = { 'yes': 0, 'freemium': 1, 'paid': 2 };
                return (order[a.is_free] || 3) - (order[b.is_free] || 3);
            }
            return 0;
        });
    }
    
    // 重新渲染
    if (virtualScroll) {
        virtualScroll.setItems(currentTools);
        // 虚拟滚动模式下，无结果时手动显示提示
        if (currentTools.length === 0) {
            const noResults = document.getElementById('no-results');
            if (noResults) {
                noResults.style.display = 'block';
                showNoResultsSuggestions();
            }
        }
    } else {
        renderTools();
    }
    
    updateResultCount();
    
    // 同步 URL（所有页面）
    syncURL();
    
    // 更新筛选按钮状态（AI 类型、分类、排序）
    updateFilterButtons();
    
    // 更新分类菜单选中状态（导航栏下拉菜单）
    updateCategoryMenuActive(currentCategory);
}

// ============================================
// 搜索匹配
// ============================================

function matchesSearch(tool, query) {
    const text = `${tool.name} ${tool.description} ${tool.category_name}`.toLowerCase();
    return text.includes(query);
}

// ============================================
// 渲染工具网格（非虚拟滚动模式）
// ============================================

function renderTools() {
    const grid = document.getElementById('tools-grid-original') || document.getElementById('tools-grid');
    const noResults = document.getElementById('no-results');
    
    if (!grid) return;
    
    if (currentTools.length === 0) {
        grid.innerHTML = '';
        if (noResults) {
            noResults.style.display = 'block';
            // 无结果时显示建议
            showNoResultsSuggestions();
        }
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    grid.innerHTML = currentTools.map(tool => {
        const aiInfo = AI_TYPE_LABELS[tool.ai_type];
        const priceInfo = tool.is_free ? PRICE_LABELS[tool.is_free] : null;
        const isFav = typeof isFavorite === 'function' && isFavorite(tool.id);
        
        const aiBadge = `<span class="ai-badge ${aiInfo.class}">${aiInfo.label}</span>`;
        const priceBadge = priceInfo ? `<span class="tool-price ${priceInfo.class}">${priceInfo.label}</span>` : '';
        const favoriteBtn = typeof toggleFavorite === 'function' 
            ? `<button class="favorite-btn ${isFav ? 'is-favorite' : ''}" data-tool-id="${tool.id}" onclick="event.stopPropagation(); toggleFavorite('${tool.id}')">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
               </button>`
            : '';
        
        let aiRecommend = '';
        if (tool.ai_type === 'traditional' && tool.ai_alternative) {
            aiRecommend = `
                <div class="ai-recommend-box">
                    <span class="label">💡 AI 替代:</span>
                    <a href="${tool.ai_alternative.url}" target="_blank">${tool.ai_alternative.name}</a>
                </div>
            `;
        }
        
        let automation = '';
        if (tool.automation) {
            automation = `
                <div class="automation-box">
                    <span class="label">⚡ 自动化:</span>
                    <a href="${tool.automation.url}" target="_blank">${tool.automation.name}</a>
                </div>
            `;
        }
        
        // 使用高亮文本
        const highlightedName = highlightText(tool.name, currentSearch);
        const highlightedDesc = highlightText(tool.description, currentSearch);
        
        return `
            <div class="tool-card" data-tool-id="${tool.id}" onclick="showToolDetail('${tool.id}')">
                ${favoriteBtn}
                <div class="tool-card-header">
                    <div class="tool-icon">${getIconHtml(tool.icon, tool.id)}</div>
                    <div class="tool-title-with-badge">
                        <span class="tool-title">${highlightedName}</span>
                        ${aiBadge}
                        ${priceBadge}
                    </div>
                </div>
                <div class="tool-card-body">
                    <p class="tool-description">${highlightedDesc}</p>
                    ${aiRecommend}
                    ${automation}
                </div>
            </div>
        `;
    }).join('');
    
    // 重新初始化懒加载
    initLazyLoading();
}

// ============================================
// 工具详情模态框
// ============================================

async function showToolDetail(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    // 记录工具点击（analytics）
    if (typeof recordToolClick === 'function') {
        recordToolClick(tool.id, tool.name, tool.category_name);
    }

    const aiInfo = AI_TYPE_LABELS[tool.ai_type];
    const priceInfo = tool.is_free ? PRICE_LABELS[tool.is_free] : null;
    const isFav = typeof isFavorite === 'function' && isFavorite(tool.id);
    
    // 异步获取评分
    const avgRating = typeof getToolAverageRating === 'function' ? await getToolAverageRating(toolId) : null;
    const reviewCount = typeof getToolReviews === 'function' ? (await getToolReviews(toolId)).length : 0;

    // 详情面板内容
    let detailHtml = `
        <div class="tool-detail">
            <h4>描述</h4>
            <p>${escapeHtml(tool.description)}</p>
            <div style="margin-top: 12px;">
                <span class="ai-badge ${aiInfo.class}">${aiInfo.label}</span>
                ${priceInfo ? `<span class="tool-price ${priceInfo.class}">${priceInfo.label}</span>` : ''}
                <span class="badge badge-secondary">${tool.category_name}</span>
            </div>
    `;

    if (tool.ai_alternative) {
        detailHtml += `
            <h4 style="margin-top: 16px;">AI 替代推荐</h4>
            <p><a href="${tool.ai_alternative.url}" target="_blank">${tool.ai_alternative.name}</a></p>
        `;
    }

    if (tool.automation) {
        detailHtml += `
            <h4 style="margin-top: 16px;">自动化脚本</h4>
            <p><a href="${tool.automation.url}" target="_blank">${tool.automation.name}</a></p>
        `;
    }

    detailHtml += '</div>';

    // 设置详情面板
    document.getElementById('modal-detail-body').innerHTML = detailHtml;

    // 设置评价面板（异步）
    if (typeof renderReviewsModal === 'function') {
        document.getElementById('modal-feedback-body').innerHTML = await renderReviewsModal(toolId, tool.name);
    }
    // 初始化反馈事件绑定
    if (typeof initFeedback === 'function') {
        initFeedback();
    }

    // 更新标题（带评分信息）
    const ratingLabel = avgRating !== null ? ` · ${avgRating}分 (${reviewCount}条评价)` : '';
    document.getElementById('modal-title').textContent = tool.name + ratingLabel;
    document.getElementById('modal-link').href = tool.url;

    // 收藏按钮
    const favBtn = document.getElementById('modal-favorite-btn');
    if (favBtn && typeof toggleFavorite === 'function') {
        favBtn.innerHTML = isFav 
            ? '<i class="fas fa-heart"></i> 已收藏' 
            : '<i class="far fa-heart"></i> 收藏';
        favBtn.onclick = () => toggleFavorite(toolId);
    }

    // 存储当前工具ID用于反馈提交
    window.currentFeedbackToolId = toolId;

    // 显示模态框
    $('#tool-modal').modal('show');

    // 绑定反馈事件（在模态框显示后）
    setTimeout(() => {
        if (typeof bindFeedbackEvents === 'function') {
            bindFeedbackEvents();
        }
    }, 100);
}

// ============================================
// 渲染分类菜单
// ============================================

function renderCategoryMenu(categories) {
    const menu = document.getElementById('category-menu');
    if (!menu) return;
    
    menu.innerHTML = categories.map(cat => `
        <a class="dropdown-item" href="category.html?category=${cat.id}">
            ${cat.name} (${cat.tools.length})
        </a>
    `).join('');
}

/**
 * 渲染分类筛选按钮（筛选区域）
 */
function renderCategoryFilterButtons(categories) {
    const container = document.getElementById('category-buttons-container');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <button class="category-btn" data-category="${cat.id}">
            ${cat.name}
        </button>
    `).join('');
}

// ============================================
// 更新结果统计
// ============================================

function updateResultCount() {
    const countEl = document.getElementById('result-count');
    if (!countEl) return;
    
    const total = allTools.length;
    const shown = currentTools.length;
    
    if (shown === total) {
        countEl.textContent = `共 ${total} 个工具`;
    } else {
        countEl.textContent = `显示 ${shown} / ${total} 个工具`;
    }
}

// ============================================
// 工具函数
// ============================================

function getIconHtml(iconUrl, toolId) {
    // 优先使用 Emoji
    if (toolId && EMOJI_ICONS[toolId]) {
        return EMOJI_ICONS[toolId];
    }
    
    // 回退到图标 URL
    if (!iconUrl) return '🔧';
    
    // Emoji 直接返回
    if (iconUrl.length <= 4) return iconUrl;
    
    // URL 图标（懒加载）
    return `<img data-src="${iconUrl}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E" alt="" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.innerHTML='🔧'">`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 性能监控（可选）
// ============================================

if (performance && performance.mark) {
    performance.mark('app-init-start');
    window.addEventListener('load', () => {
        performance.mark('app-init-end');
        performance.measure('app-init', 'app-init-start', 'app-init-end');
        const measure = performance.getEntriesByName('app-init')[0];
        if (measure) {
            console.log(`⏱️ 页面加载耗时: ${measure.duration.toFixed(2)}ms`);
        }
    });
}
