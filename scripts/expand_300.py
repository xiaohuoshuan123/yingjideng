#!/usr/bin/env python3
"""W3 阶段：最后 5 个新工具"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

NEW_5 = [
    {'cat': 'ai-scheduling', 'id': 'sunsama', 'name': 'Sunsama', 'url': 'https://sunsama.com', 'description': 'AI 驱动的每日计划助手', 'ai_type': 'ai-native', 'is_free': 'paid', 'icon': '🌞'},
    {'cat': 'ai-meeting', 'name': 'Fathom', 'url': 'https://www.fathom.so', 'description': '免费会议记录和摘要', 'ai_type': 'ai-native', 'id': 'fathom', 'is_free': 'yes', 'icon': '🌊'},
    {'cat': 'ai-voice', 'name': 'Speechify', 'url': 'https://speechify.com', 'description': 'AI 文本朗读工具', 'ai_type': 'ai-native', 'id': 'speechify-ai', 'is_free': 'freemium', 'icon': '📖'},
    {'cat': 'ai-writing', 'name': 'Rytr', 'url': 'https://rytr.me', 'description': 'AI 内容生成器', 'ai_type': 'ai-native', 'id': 'rytr', 'is_free': 'freemium', 'icon': '✍️'},
    {'cat': 'ai-image', 'name': 'StockAI', 'url': 'https://stockai.app', 'description': 'AI 生成库存图片', 'ai_type': 'ai-native', 'id': 'stockai', 'is_free': 'paid', 'icon': '🖼️'},
]

added = 0
for t in NEW_5:
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