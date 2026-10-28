#!/usr/bin/env python3
"""W3 阶段：最后 5 个工具，突破 300"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

TOOLS_FINAL = [
    {'cat': 'learn', 'id': 'z-library', 'name': 'Z-Library', 'url': 'https://z-library.sk', 'description': '数字图书馆，海量电子书', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📖'},
    {'cat': 'productivity', 'id': 'evernote', 'name': 'Evernote', 'url': 'https://evernote.com', 'description': '笔记和知识管理', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📔'},
    {'cat': 'ai-models', 'id': 'deepseek', 'name': 'DeepSeek', 'url': 'https://deepseek.com', 'description': '中国开源大模型', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔍'},
    {'cat': 'ai-image', 'id': 'midjourney', 'name': 'Midjourney', 'url': 'https://midjourney.com', 'description': 'Discord 上 AI 绘画', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎭'},
    {'cat': 'ai-voice', 'id': 'murf', 'name': 'Murf.ai', 'url': 'https://murf.ai', 'description': 'AI 语音工作室', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎤'},
]

added = 0
for t in TOOLS_FINAL:
    cat_id = t.pop('cat')
    if t['id'] not in existing_ids:
        for cat in data['categories']:
            if cat['id'] == cat_id:
                cat['tools'].append(t)
                existing_ids.add(t['id'])
                added += 1
                print(f"✅ {cat['name']}: +{t['name']}")
                break

total = sum(len(c['tools']) for c in data['categories'])
print(f"\n📊 新增 {added} 个，总计 {total} 个工具 🎉")

with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("✅ 已保存")