#!/usr/bin/env python3
"""W4: 生成 OG Image 占位图 (纯文本 SVG)"""
import os

# 创建简单的 SVG OG 图片
og_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>
  
  <!-- 装饰圆圈 -->
  <circle cx="100" cy="100" r="150" fill="rgba(255,255,255,0.1)"/>
  <circle cx="1100" cy="530" r="200" fill="rgba(255,255,255,0.08)"/>
  <circle cx="600" cy="315" r="250" fill="rgba(255,255,255,0.05)"/>
  
  <!-- 主标题 -->
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle">yingjideng</text>
  
  <!-- 副标题 -->
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)" text-anchor="middle">传统工具 × AI 增强</text>
  
  <!-- 描述 -->
  <text x="600" y="410" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle">300+ AI 增强效率工具导航站</text>
  
  <!-- 底部信息 -->
  <text x="600" y="550" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.5)" text-anchor="middle">yingjideng.dpdns.org</text>
</svg>
'''

with open('og-image.svg', 'w', encoding='utf-8') as f:
    f.write(og_svg)

print("✅ og-image.svg 已生成")
print("   位置: og-image.svg")
print("   尺寸: 1200x630 (标准 OG 图片尺寸)")
print("   说明: 社交媒体分享时使用，可在线转换为 PNG")