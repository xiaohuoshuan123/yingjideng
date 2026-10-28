#!/usr/bin/env python3
"""W4: 生成 sitemap.xml 和 robots.txt"""
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom

BASE_URL = "https://yingjideng.dpdns.org"

# 读取工具数据
with open('data/tools.json') as f:
    data = json.load(f)

# 1. 生成 sitemap.xml
root = ET.Element('urlset')
root.set('xmlns', 'https://www.sitemaps.org/schemas/sitemap/0.9')

# 首页和主要页面
main_pages = ['index.html', 'category.html', 'favorites.html']
for page in main_pages:
    url = ET.SubElement(root, 'url')
    loc = ET.SubElement(url, 'loc')
    loc.text = f"{BASE_URL}/{page}"
    lastmod = ET.SubElement(url, 'lastmod')
    lastmod.text = '2026-05-22'
    priority = ET.SubElement(url, 'priority')
    priority.text = '0.9' if page == 'index.html' else '0.8'

# 分类页
for cat in data['categories']:
    url = ET.SubElement(root, 'url')
    loc = ET.SubElement(url, 'loc')
    loc.text = f"{BASE_URL}/category.html?category={cat['id']}"
    lastmod = ET.SubElement(url, 'lastmod')
    lastmod.text = '2026-05-22'
    priority = ET.SubElement(url, 'priority')
    priority.text = '0.7'

# 工具详情页（每个工具一个页面）
for cat in data['categories']:
    for tool in cat['tools']:
        url = ET.SubElement(root, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{BASE_URL}/tool.html?id={tool['id']}"
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = '2026-05-22'
        priority = ET.SubElement(url, 'priority')
        priority.text = '0.5'

# 美化 XML
xml_str = ET.tostring(root, encoding='utf-8')
dom = minidom.parseString(xml_str)
pretty_xml = dom.toprettyxml(indent='  ', encoding='utf-8').decode('utf-8')
# 去掉第一行多余的声明
lines = pretty_xml.split('\n')
sitemap_content = '\n'.join(lines[1:])

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

# 2. 生成 robots.txt
robots_content = """# yingjideng - AI 增强工具导航站
# robots.txt

User-agent: *
Allow: /

# Sitemap 位置
Sitemap: https://yingjideng.dpdns.org/sitemap.xml

# crawl-delay 让搜索引擎不要太频繁
Crawl-delay: 1

# 允许抓取所有静态资源
Allow: /css/
Allow: /js/
Allow: /data/
"""

with open('robots.txt', 'w', encoding='utf-8') as f:
    f.write(robots_content)

print(f"✅ sitemap.xml 生成完成: {len(root)} 个 URL")
print(f"✅ robots.txt 生成完成")
print(f"\n文件位置:")
print(f"  - sitemap.xml")
print(f"  - robots.txt")