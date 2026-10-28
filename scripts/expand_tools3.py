#!/usr/bin/env python3
"""W3 阶段：最终补充，达到 300+ 工具"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

FINAL_TOOLS = {
    'dev': [
        {'id': 'railway', 'name': 'Railway', 'url': 'https://railway.app', 'description': '一键部署全栈应用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🚂'},
        {'id': 'supabase', 'name': 'Supabase', 'url': 'https://supabase.com', 'description': '开源 Firebase 替代品', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🟢'},
        {'id': 'vercel', 'name': 'Vercel', 'url': 'https://vercel.com', 'description': '前端部署和 Serverless', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '▲'},
    ],
    'design': [
        {'id': 'prisma', 'name': 'Prisma AI', 'url': 'https://www.prisma.ai', 'description': 'AI 图片增强和编辑', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔮'},
        {'id': 'remove-bg', 'name': 'Remove.bg', 'url': 'https://www.remove.bg', 'description': '一键去除图片背景', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✂️'},
    ],
    'office': [
        {'id': 'airtable', 'name': 'Airtable', 'url': 'https://airtable.com', 'description': '云端数据库和协作', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📊'},
        {'id': 'smartsheet', 'name': 'Smartsheet', 'url': 'https://www.smartsheet.com', 'description': '企业项目管理平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📋'},
    ],
    'video': [
        {'id': 'synthesia', 'name': 'Synthesia', 'url': 'https://www.synthesia.io', 'description': 'AI 数字人视频生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🤖'},
        {'id': 'd-id', 'name': 'D-ID', 'url': 'https://www.d-id.com', 'description': 'AI 头像视频生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎭'},
    ],
    'learn': [
        {'id': 'brilliant', 'name': 'Brilliant', 'url': 'https://brilliant.org', 'description': '交互式 STEM 学习', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💡'},
        {'id': 'anki', 'name': 'Anki', 'url': 'https://ankiweb.net', 'description': '间隔重复记忆卡片', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🃏'},
    ],
    'cloud': [
        {'id': 'aws', 'name': 'AWS', 'url': 'https://aws.amazon.com', 'description': '亚马逊云服务', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'azure', 'name': 'Azure', 'url': 'https://azure.microsoft.com', 'description': '微软云平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔷'},
    ],
    'productivity': [
        {'id': 'zapier', 'name': 'Zapier', 'url': 'https://zapier.com', 'description': '应用自动化连接平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⚡'},
        {'id': 'n8n', 'name': 'n8n', 'url': 'https://n8n.io', 'description': '开源工作流自动化工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔗'},
    ],
    'data': [
        {'id': 'tableau', 'name': 'Tableau', 'url': 'https://www.tableau.com', 'description': '专业数据可视化工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📈'},
        {'id': 'powerbi', 'name': 'Power BI', 'url': 'https://powerbi.microsoft.com', 'description': '微软商业智能平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📊'},
    ],
    'ai-models': [
        {'id': 'huggingface', 'name': 'Hugging Face', 'url': 'https://huggingface.co', 'description': 'AI 模型社区和仓库', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🤗'},
        {'id': 'ollama', 'name': 'Ollama', 'url': 'https://ollama.com', 'description': '本地运行大语言模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🦙'},
    ],
    'ai-writing': [
        {'id': 'quillbot', 'name': 'QuillBot', 'url': 'https://quillbot.com', 'description': 'AI 文本改写和润色', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔄'},
        {'id': 'grammarly', 'name': 'Grammarly', 'url': 'https://www.grammarly.com', 'description': 'AI 语法检查和写作助手', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✍️'},
    ],
    'ai-presentation': [
        {'id': 'canva-presentations', 'name': 'Canva 演示', 'url': 'https://www.canva.com/create/presentations/', 'description': 'Canva 演示文稿制作', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🖼️'},
    ],
    'ai-social': [
        {'id': 'socialbee', 'name': 'SocialBee', 'url': 'https://socialbee.com', 'description': '社交媒体内容分类发布', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🐝'},
    ],
    'ai-coding': [
        {'id': 'codex', 'name': 'OpenAI Codex', 'url': 'https://openai.com', 'description': 'AI 代码生成模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🤖'},
    ],
    'ai-search': [
        {'id': 'search15', 'name': 'Search15', 'url': 'https://www.search15.com', 'description': 'AI 聚合搜索引擎', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🔍'},
    ],
    'ai-image': [
        {'id': 'adobe-firefly', 'name': 'Adobe Firefly', 'url': 'https://firefly.adobe.com', 'description': 'Adobe 商用 AI 图像模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔥'},
    ],
    'ai-voice': [
        {'id': 'elevenlabs', 'name': 'ElevenLabs', 'url': 'https://elevenlabs.io', 'description': '最逼真的 AI 语音合成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔊'},
    ],
    'ai-no-code': [
        {'id': 'readymag', 'name': 'Readymag', 'url': 'https://readymag.com', 'description': '创意网页设计工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📰'},
    ],
    'ai-devops': [
        {'id': 'terraform', 'name': 'Terraform', 'url': 'https://www.terraform.io', 'description': '基础设施即代码工具', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🏗️'},
    ],
}

added = 0
for cat_id, tools in FINAL_TOOLS.items():
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