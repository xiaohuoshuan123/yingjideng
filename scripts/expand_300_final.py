#!/usr/bin/env python3
"""W3 阶段：第 300 个工具"""
import json

with open('data/tools.json') as f:
    data = json.load(f)

existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

# 第 300 个工具
tool = {
    'id': 'notion',
    'name': 'Notion',
    'url': 'https://www.notion.so',
    'description': '全能型笔记和协作平台，含 AI 功能',
    'ai_type': 'ai-enhanced',
    'is_free': 'freemium',
    'icon': '📓'
}

if tool['id'] not in existing_ids:
    for cat in data['categories']:
        if cat['id'] == 'office':
            cat['tools'].append(tool)
            print(f"✅ 办公工具: +Notion")
            break

total = sum(len(c['tools']) for c in data['categories'])
print(f"\n📊 总计 {total} 个工具 🎉🎉🎉")

with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("✅ 已保存")