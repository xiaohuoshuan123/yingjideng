#!/usr/bin/env python3
"""W3 阶段：继续扩充 AI 相关分类工具"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

# 继续扩充的分类
MORE_TOOLS = {
    'data': [
        {'id': 'metabase', 'name': 'Metabase', 'url': 'https://www.metabase.com', 'description': '开源商业智能工具，轻松提问数据', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📉'},
        {'id': 'looker', 'name': 'Looker', 'url': 'https://looker.com', 'description': 'Google 商业智能平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🔍'},
        {'id': 'qlik', 'name': 'Qlik Sense', 'url': 'https://www.qlik.com', 'description': '数据可视化和 BI 平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📊'},
        {'id': 'domo', 'name': 'Domo', 'url': 'https://www.domo.com', 'description': '云端商业操作系统', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📊'},
        {'id': 'sisense', 'name': 'Sisense', 'url': 'https://www.sisense.com', 'description': '嵌入式分析平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📈'},
    ],
    'ai-models': [
        {'id': 'gemini', 'name': 'Google Gemini', 'url': 'https://gemini.google.com', 'description': 'Google 多模态 AI 助手', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💎'},
        {'id': 'mistral', 'name': 'Mistral AI', 'url': 'https://mistral.ai', 'description': '欧洲开源大模型公司', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌬️'},
        {'id': 'groq', 'name': 'Groq', 'url': 'https://groq.com', 'description': '超高速 AI 推理平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⚡'},
        {'id': 'cohere', 'name': 'Cohere', 'url': 'https://cohere.com', 'description': '企业级 AI 语言模型 API', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔗'},
        {'id': 'anthropic', 'name': 'Anthropic API', 'url': 'https://anthropic.com', 'description': 'Claude 模型 API 服务', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🏛️'},
        {'id': 'together-ai', 'name': 'Together AI', 'url': 'https://together.ai', 'description': '开源模型推理平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🤝'},
        {'id': 'anyscale', 'name': 'Anyscale', 'url': 'https://anyscale.com', 'description': '分布式 AI 训练平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '☁️'},
        {'id': 'replicate', 'name': 'Replicate', 'url': 'https://replicate.com', 'description': '一键部署 AI 模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔄'},
    ],
    'ai-writing': [
        {'id': 'copyai', 'name': 'Copy.ai', 'url': 'https://www.copy.ai', 'description': 'AI 营销文案生成器', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📋'},
        {'id': 'jasper', 'name': 'Jasper', 'url': 'https://www.jasper.ai', 'description': '企业级 AI 内容创作平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎨'},
        {'id': 'writesonic', 'name': 'Writesonic', 'url': 'https://writesonic.com', 'description': 'AI 文章和广告文案生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✍️'},
        {'id': 'frase', 'name': 'Frase', 'url': 'https://www.frase.io', 'description': 'AI 内容研究和写作工具', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🦒'},
        {'id': 'surfer', 'name': 'Surfer SEO', 'url': 'https://surferseo.com', 'description': 'AI 驱动的 SEO 内容优化', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🏄'},
    ],
    'ai-presentation': [
        {'id': 'gamma', 'name': 'Gamma', 'url': 'https://gamma.app', 'description': 'AI 生成演示文稿和网页', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌟'},
        {'id': 'tome', 'name': 'Tome', 'url': 'https://tome.app', 'description': 'AI 叙事演示工具', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📖'},
        {'id': 'slidesgo-ai', 'name': 'Slidesgo', 'url': 'https://slidesgo.com', 'description': '免费 PPT 模板，含 AI 生成', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📊'},
        {'id': 'beautiful-ai', 'name': 'Beautiful.ai', 'url': 'https://www.beautiful.ai', 'description': '智能演示文稿设计工具', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎨'},
    ],
    'ai-scheduling': [
        {'id': 'reclaim', 'name': 'Reclaim.ai', 'url': 'https://reclaim.ai', 'description': 'AI 日程优化和习惯培养', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔄'},
        {'id': 'clockwise', 'name': 'Clockwise', 'url': 'https://www.getclockwise.com', 'description': '团队日程智能优化', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⏰'},
        {'id': 'motion-schedule', 'name': 'Motion', 'url': 'https://www.usemotion.com', 'description': 'AI 自动排程助手', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎬'},
    ],
    'ai-meeting': [
        {'id': 'fireflies', 'name': 'Fireflies.ai', 'url': 'https://fireflies.ai', 'description': 'AI 会议记录和转录', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🪲'},
        {'id': 'grain', 'name': 'Grain', 'url': 'https://grain.com', 'description': '视频访谈和会议摘要', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌾'},
        {'id': 'otter', 'name': 'Otter.ai', 'url': 'https://otter.ai', 'description': '实时语音转录和笔记', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🦦'},
        {'id': 'tlfdv', 'name': 'tl;dv', 'url': 'https://tldv.io', 'description': '会议录制和 AI 摘要', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⏩'},
    ],
    'ai-social': [
        {'id': 'buffer', 'name': 'Buffer', 'url': 'https://buffer.com', 'description': '社交媒体管理工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📱'},
        {'id': 'hootsuite', 'name': 'Hootsuite', 'url': 'https://hootsuite.com', 'description': '社交媒体管理平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🦉'},
        {'id': 'sprout', 'name': 'Sprout Social', 'url': 'https://sproutsocial.com', 'description': '社交媒体分析和互动', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🌱'},
        {'id': 'later', 'name': 'Later', 'url': 'https://later.com', 'description': 'Instagram 视觉内容规划', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📅'},
        {'id': 'planoly', 'name': 'Planoly', 'url': 'https://planoly.com', 'description': 'Instagram 内容规划工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📱'},
    ],
    'ai-coding': [
        {'id': 'tabnine', 'name': 'Tabnine', 'url': 'https://www.tabnine.com', 'description': 'AI 代码补全工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🐕'},
        {'id': 'codeium', 'name': 'Codeium', 'url': 'https://codeium.com', 'description': '免费 AI 编程助手', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🎯'},
        {'id': 'sourcegraph', 'name': 'Sourcegraph', 'url': 'https://sourcegraph.com', 'description': '代码搜索和智能导航', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔍'},
        {'id': 'ghostty', 'name': 'Ghostty', 'url': 'https://ghostty.org', 'description': '快速、功能丰富的终端模拟器', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '👻'},
        {'id': 'warp', 'name': 'Warp', 'url': 'https://www.warp.dev', 'description': 'AI 驱动的现代化终端', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌀'},
    ],
    'ai-search': [
        {'id': 'perplexity', 'name': 'Perplexity', 'url': 'https://www.perplexity.ai', 'description': 'AI 搜索引擎，带引用来源', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔍'},
        {'id': 'you', 'name': 'You.com', 'url': 'https://you.com', 'description': '可定制的 AI 搜索引擎', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔎'},
        {'id': 'phind', 'name': 'Phind', 'url': 'https://www.phind.com', 'description': '开发者专用 AI 搜索引擎', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🔧'},
        {'id': 'brave-search', 'name': 'Brave Search', 'url': 'https://search.brave.com', 'description': '隐私优先的 AI 搜索引擎', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🦁'},
    ],
    'ai-image': [
        {'id': 'leonardo', 'name': 'Leonardo.ai', 'url': 'https://leonardo.ai', 'description': 'AI 图像生成平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🦁'},
        {'id': 'dreamstudio', 'name': 'DreamStudio', 'url': 'https://dreamstudio.ai', 'description': 'Stability AI 官方图像生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💭'},
        {'id': 'clipdrop', 'name': 'Clipdrop', 'url': 'https://clipdrop.co', 'description': 'AI 图像编辑工具集', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✂️'},
        {'id': 'playground', 'name': 'Playground AI', 'url': 'https://playgroundai.com', 'description': '在线 AI 图像创作平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎨'},
        {'id': 'nightcafe', 'name': 'NightCafe', 'url': 'https://creator.nightcafe.studio', 'description': 'AI 艺术创作社区', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌙'},
    ],
    'ai-voice': [
        {'id': 'playht', 'name': 'Play.ht', 'url': 'https://play.ht', 'description': 'AI 语音生成和克隆', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎙️'},
        {'id': 'murf', 'name': 'Murf.ai', 'url': 'https://murf.ai', 'description': 'AI 语音合成平台', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎤'},
        {'id': 'speechify', 'name': 'Speechify', 'url': 'https://speechify.com', 'description': '文本转语音阅读工具', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📖'},
        {'id': 'lovo', 'name': 'LOVO', 'url': 'https://lovo.ai', 'description': 'AI 语音生成器', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎭'},
        {'id': 'resemble', 'name': 'Resemble AI', 'url': 'https://www.resemble.ai', 'description': 'AI 语音克隆和生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🔊'},
    ],
    'ai-no-code': [
        {'id': 'webflow', 'name': 'Webflow', 'url': 'https://webflow.com', 'description': '可视化网站构建器', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌊'},
        {'id': 'framer', 'name': 'Framer', 'url': 'https://framer.com', 'description': 'AI 驱动的网站设计工具', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🖼️'},
        {'id': 'bubble', 'name': 'Bubble', 'url': 'https://bubble.io', 'description': '无代码 Web 应用开发平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🫧'},
        {'id': 'webflow-studio', 'name': 'Webflow Studio', 'url': 'https://webflow.com', 'description': 'Webflow 桌面编辑器', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🎨'},
    ],
    'ai-devops': [
        {'id': 'gitlab-duo', 'name': 'GitLab Duo', 'url': 'https://gitlab.com', 'description': 'GitLab 内置 AI 助手', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🦊'},
        {'id': 'jetbrains-space', 'name': 'JetBrains Space', 'url': 'https://www.jetbrains.com/space/', 'description': '一体化 DevOps 平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔧'},
        {'id': 'circleci', 'name': 'CircleCI', 'url': 'https://circleci.com', 'description': '云端 CI/CD 平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⚡'},
        {'id': 'github-actions', 'name': 'GitHub Actions', 'url': 'https://github.com/features/actions', 'description': 'GitHub 原生 CI/CD', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🐙'},
        {'id': 'jenkins-ai', 'name': 'Jenkins', 'url': 'https://www.jenkins.io', 'description': '开源自动化服务器', 'ai_type': 'traditional', 'ai_alternative': {'name': 'GitHub Actions', 'url': 'https://github.com/features/actions'}, 'automation': None, 'is_free': 'yes', 'icon': '🔧'},
    ],
}

added = 0
for cat_id, tools in MORE_TOOLS.items():
    for cat in data['categories']:
        if cat['id'] == cat_id:
            for tool in tools:
                if tool['id'] not in existing_ids:
                    cat['tools'].append(tool)
                    existing_ids.add(tool['id'])
                    added += 1
            print(f"✅ {cat['name']}: 新增 {len(tools)} 个，共 {len(cat['tools'])} 个")
            break

total = sum(len(c['tools']) for c in data['categories'])
print(f"\n📊 新增 {added} 个，总计 {total} 个工具")

with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("✅ 已保存")