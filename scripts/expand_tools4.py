#!/usr/bin/env python3
"""W3 阶段：补充到 300+"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

TOOLS_300 = {
    'dev': [
        {'id': 'docker', 'name': 'Docker', 'url': 'https://www.docker.com', 'description': '容器化平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🐳'},
        {'id': 'kubernetes', 'name': 'Kubernetes', 'url': 'https://kubernetes.io', 'description': '容器编排系统', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '☸️'},
        {'id': 'ansible', 'name': 'Ansible', 'url': 'https://www.ansible.com', 'description': '自动化配置管理', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '⚙️'},
    ],
    'design': [
        {'id': 'unsplash', 'name': 'Unsplash', 'url': 'https://unsplash.com', 'description': '免费高质量图片库', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📸'},
        {'id': 'pexels', 'name': 'Pexels', 'url': 'https://www.pexels.com', 'description': '免费图片和视频素材', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📷'},
    ],
    'office': [
        {'id': 'slack', 'name': 'Slack', 'url': 'https://slack.com', 'description': '团队协作沟通工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💬'},
        {'id': 'discord', 'name': 'Discord', 'url': 'https://discord.com', 'description': '社区和团队语音聊天', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🎮'},
    ],
    'video': [
        {'id': 'pictory', 'name': 'Pictory', 'url': 'https://pictory.ai', 'description': 'AI 视频自动生成', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎥'},
    ],
    'learn': [
        {'id': 'khan-academy', 'name': 'Khan Academy', 'url': 'https://www.khanacademy.org', 'description': '免费在线教育平台', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📚'},
    ],
    'cloud': [
        {'id': 'gcp', 'name': 'Google Cloud', 'url': 'https://cloud.google.com', 'description': '谷歌云平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔶'},
    ],
    'productivity': [
        {'id': 'ifttt', 'name': 'IFTTT', 'url': 'https://ifttt.com', 'description': '应用间自动化连接', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔀'},
        {'id': 'make', 'name': 'Make', 'url': 'https://www.make.com', 'description': '可视化自动化平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎨'},
    ],
    'data': [
        {'id': 'google-analytics', 'name': 'Google Analytics', 'url': 'https://analytics.google.com', 'description': '网站流量分析', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📊'},
    ],
    'ai-models': [
        {'id': 'qwen', 'name': '通义千问', 'url': 'https://tongyi.aliyun.com', 'description': '阿里巴巴大模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌊'},
        {'id': 'kimi', 'name': 'Kimi 月之暗面', 'url': 'https://kimi.moonshot.cn', 'description': '长文本 AI 助手', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🌙'},
    ],
    'ai-writing': [
        {'id': 'notion-ai', 'name': 'Notion AI', 'url': 'https://www.notion.so/product/ai', 'description': 'Notion 内置 AI 写作', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📓'},
    ],
    'ai-coding': [
        {'id': 'windsurf', 'name': 'Windsurf', 'url': 'https://codeium.com/windsurf', 'description': 'AI 代码编辑器', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌊'},
    ],
    'ai-image': [
        {'id': 'stability-ai', 'name': 'Stability AI', 'url': 'https://stability.ai', 'description': '开源 AI 图像模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🧬'},
    ],
    'ai-voice': [
        {'id': 'speechify', 'name': 'Speechify', 'url': 'https://speechify.com', 'description': 'AI 文本朗读', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📖'},
    ],
}

added = 0
for cat_id, tools in TOOLS_300.items():
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