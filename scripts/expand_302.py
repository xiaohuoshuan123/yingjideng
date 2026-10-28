#!/usr/bin/env python3
"""W3 阶段：最后 2 个工具，突破 300"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

LAST_2 = [
    {'cat': 'ai-meeting', 'id': 'tlfdv-ai', 'name': 'tl;dv', 'url': 'https://tldv.io', 'description': '会议录制和 AI 摘要', 'ai_type': 'ai-native', 'is_free': 'freemium', 'icon': '⏩'},
    {'cat': 'ai-writing', 'id': 'hemingway', 'name': 'Hemingway Editor', 'url': 'https://hemingwayapp.com', 'description': '写作清晰度和可读性检查', 'ai_type': 'ai-enhanced', 'is_free': 'freemium', 'icon': '📝'},
]

added = 0
for t in LAST_2:
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
print(f"\n📊 新增 {added} 个，总计 {total} 个工具 🎉🎉")

with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("✅ 已保存")