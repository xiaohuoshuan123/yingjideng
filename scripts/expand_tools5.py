#!/usr/bin/env python3
"""W3 阶段：最后 8 个工具，达到 300+"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

FINAL_8 = {
    'learn': [
        {'id': 'coursera', 'name': 'Coursera', 'url': 'https://www.coursera.org', 'description': '大学在线课程平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎓'},
        {'id': 'duolingo', 'name': 'Duolingo', 'url': 'https://www.duolingo.com', 'description': 'AI 语言学习应用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🦉'},
    ],
    'cloud': [
        {'id': 'netlify', 'name': 'Netlify', 'url': 'https://www.netlify.com', 'description': '静态网站托管和部署', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔷'},
    ],
    'productivity': [
        {'id': 'dropbox', 'name': 'Dropbox', 'url': 'https://www.dropbox.com', 'description': '云存储和文件共享', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📦'},
    ],
    'ai-voice': [
        {'id': 'openai-tts', 'name': 'OpenAI TTS', 'url': 'https://platform.openai.com/docs/guides/text-to-speech', 'description': 'OpenAI 文本转语音 API', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🔊'},
    ],
    'ai-no-code': [
        {'id': 'tilda', 'name': 'Tilda', 'url': 'https://tilda.cc', 'description': '落地页和网站构建器', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🏗️'},
    ],
    'ai-devops': [
        {'id': 'jenkins', 'name': 'Jenkins', 'url': 'https://www.jenkins.io', 'description': '开源自动化服务器', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🔧'},
    ],
}

added = 0
for cat_id, tools in FINAL_8.items():
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