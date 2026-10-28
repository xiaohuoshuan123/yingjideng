#!/usr/bin/env python3
"""W3 阶段：批量扩充工具数据，目标 300+ 工具"""
import json

# 读取现有数据
with open('data/tools.json') as f:
    data = json.load(f)

# 已有工具ID集合
existing_ids = set()
for cat in data['categories']:
    for tool in cat['tools']:
        existing_ids.add(tool['id'])

print(f"已有 {len(existing_ids)} 个工具")

# 新工具数据 - 按分类组织
# 每个工具: id, name, url, description, ai_type, ai_alternative, automation, is_free, icon

NEW_TOOLS = {
    # === 开发工具 (扩充到 20 个) ===
    'dev': [
        {'id': 'jetbrains-mps', 'name': 'JetBrains MPS', 'url': 'https://www.jetbrains.com/mps/', 'description': '语言工作平台，创建自定义编程语言和 DSL', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🔧'},
        {'id': 'atom', 'name': 'Atom', 'url': 'https://atom.io', 'description': 'GitHub 开源文本编辑器，高度可定制（已归档）', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Cursor', 'url': 'https://cursor.sh'}, 'automation': None, 'is_free': 'yes', 'icon': '🔧'},
        {'id': 'sublime-text', 'name': 'Sublime Text', 'url': 'https://www.sublimetext.com', 'description': '快速、轻量级代码编辑器，支持多行编辑', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Cursor', 'url': 'https://cursor.sh'}, 'automation': None, 'is_free': 'freemium', 'icon': '⚡'},
        {'id': 'brackets', 'name': 'Brackets', 'url': 'https://brackets.io', 'description': 'Adobe 开源前端编辑器，专注 Web 开发', 'ai_type': 'traditional', 'ai_alternative': {'name': 'VS Code', 'url': 'https://code.visualstudio.com'}, 'automation': None, 'is_free': 'yes', 'icon': '🎨'},
        {'id': 'netbeans', 'name': 'NetBeans', 'url': 'https://netbeans.apache.org', 'description': '开源 Java IDE，支持多语言开发', 'ai_type': 'traditional', 'ai_alternative': {'name': 'IntelliJ IDEA', 'url': 'https://www.jetbrains.com/idea/'}, 'automation': None, 'is_free': 'yes', 'icon': '🔧'},
        {'id': 'xcode', 'name': 'Xcode', 'url': 'https://developer.apple.com/xcode/', 'description': 'Apple 官方 IDE，开发 iOS/macOS 应用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🍎'},
        {'id': 'intellij', 'name': 'IntelliJ IDEA', 'url': 'https://www.jetbrains.com/idea/', 'description': '强大的 Java/Kotlin IDE，智能代码辅助', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔧'},
        {'id': 'pycharm', 'name': 'PyCharm', 'url': 'https://www.jetbrains.com/pycharm/', 'description': '专业 Python IDE，支持 Web 开发和数据科学', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🐍'},
        {'id': 'ruby-mine', 'name': 'RubyMine', 'url': 'https://www.jetbrains.com/ruby/', 'description': 'Ruby/Rails 专用 IDE', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '💎'},
        {'id': 'php-storm', 'name': 'PhpStorm', 'url': 'https://www.jetbrains.com/phpstorm/', 'description': '专业 PHP IDE，支持 Laravel/Symfony', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🐘'},
    ],
    
    # === 设计工具 (扩充到 20 个) ===
    'design': [
        {'id': 'affinity-designer', 'name': 'Affinity Designer', 'url': 'https://affinity.serif.com/designer/', 'description': '专业矢量设计软件，一次性付费', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Figma', 'url': 'https://figma.com'}, 'automation': None, 'is_free': 'paid', 'icon': '🎨'},
        {'id': 'sketch', 'name': 'Sketch', 'url': 'https://www.sketch.com', 'description': 'Mac 原生 UI/UX 设计工具', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Figma', 'url': 'https://figma.com'}, 'automation': None, 'is_free': 'paid', 'icon': '✏️'},
        {'id': 'inkline', 'name': 'Inkscape', 'url': 'https://inkscape.org', 'description': '开源矢量图形编辑器', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Figma', 'url': 'https://figma.com'}, 'automation': None, 'is_free': 'yes', 'icon': '🎨'},
        {'id': 'gimp', 'name': 'GIMP', 'url': 'https://www.gimp.org', 'description': '开源图像编辑器，Photoshop 替代品', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Photoshop', 'url': 'https://adobe.com/products/photoshop'}, 'automation': None, 'is_free': 'yes', 'icon': '🖼️'},
        {'id': 'krita', 'name': 'Krita', 'url': 'https://krita.org', 'description': '开源数字绘画软件，专注插画和概念艺术', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Procreate', 'url': 'https://procreate.com'}, 'automation': None, 'is_free': 'yes', 'icon': '🎨'},
        {'id': 'blender', 'name': 'Blender', 'url': 'https://www.blender.org', 'description': '开源 3D 创作套件，建模/动画/渲染', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🧊'},
        {'id': 'figma-clone', 'name': 'Penpot', 'url': 'https://penpot.app', 'description': '开源设计协作工具，Figma 替代品', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🎨'},
        {'id': 'canva-education', 'name': 'Canva for Education', 'url': 'https://www.canva.com/education/', 'description': '教育版 Canva，免费教师和学生使用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '🖌️'},
        {'id': 'adobe-express', 'name': 'Adobe Express', 'url': 'https://www.adobe.com/express/', 'description': '快速创建社交媒体图形和网页', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✨'},
        {'id': ' piktochart', 'name': 'Piktochart', 'url': 'https://piktochart.com', 'description': '信息图表和演示文稿制作工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📊'},
    ],
    
    # === 办公工具 (扩充到 20 个) ===
    'office': [
        {'id': 'microsoft-365', 'name': 'Microsoft 365', 'url': 'https://www.microsoft.com/microsoft-365', 'description': 'Office 套件云端版，含 Copilot AI', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '📝'},
        {'id': 'google-docs', 'name': 'Google Docs', 'url': 'https://docs.google.com', 'description': '在线文档编辑，支持协作', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📄'},
        {'id': 'google-sheets', 'name': 'Google Sheets', 'url': 'https://sheets.google.com', 'description': '在线电子表格，支持协作和脚本', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📊'},
        {'id': 'google-slides', 'name': 'Google Slides', 'url': 'https://slides.google.com', 'description': '在线演示文稿制作', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📽️'},
        {'id': 'evernote', 'name': 'Evernote', 'url': 'https://evernote.com', 'description': '笔记管理工具，支持多平台同步', 'ai_type': 'ai-enhanced', 'ai_alternative': {'name': 'Notion', 'url': 'https://notion.so'}, 'automation': None, 'is_free': 'freemium', 'icon': '📔'},
        {'id': 'onenote', 'name': 'OneNote', 'url': 'https://www.onenote.com', 'description': '微软数字笔记本，免费使用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📓'},
        {'id': 'trello', 'name': 'Trello', 'url': 'https://trello.com', 'description': '看板项目管理工具', 'ai_type': 'ai-enhanced', 'ai_alternative': {'name': 'Notion', 'url': 'https://notion.so'}, 'automation': None, 'is_free': 'freemium', 'icon': '📋'},
        {'id': 'asana', 'name': 'Asana', 'url': 'https://asana.com', 'description': '团队项目协作平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✅'},
        {'id': 'monday', 'name': 'Monday.com', 'url': 'https://monday.com', 'description': '可视化工作管理平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📅'},
        {'id': 'clickup', 'name': 'ClickUp', 'url': 'https://clickup.com', 'description': '全能型项目管理工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✅'},
    ],
    
    # === 视频工具 (扩充到 15 个) ===
    'video': [
        {'id': 'davinci-resolve', 'name': 'DaVinci Resolve', 'url': 'https://www.blackmagicdesign.com/products/davinciresolve', 'description': '专业视频剪辑和调色软件，免费版功能强大', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎬'},
        {'id': 'final-cut-pro', 'name': 'Final Cut Pro', 'url': 'https://www.apple.com/final-cut-pro/', 'description': 'Mac 专业视频剪辑软件', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎥'},
        {'id': 'hitfilm', 'name': 'HitFilm', 'url': 'https://hitfilm.com', 'description': '视频剪辑和 VFX 合成工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎬'},
        {'id': 'open-shot', 'name': 'OpenShot', 'url': 'https://www.openshot.org', 'description': '开源跨平台视频编辑器', 'ai_type': 'traditional', 'ai_alternative': {'name': 'DaVinci Resolve', 'url': 'https://blackmagicdesign.com'}, 'automation': None, 'is_free': 'yes', 'icon': '🎬'},
        {'id': 'shotcut', 'name': 'Shotcut', 'url': 'https://shotcut.org', 'description': '开源免费视频编辑器', 'ai_type': 'traditional', 'ai_alternative': {'name': 'DaVinci Resolve', 'url': 'https://blackmagicdesign.com'}, 'automation': None, 'is_free': 'yes', 'icon': '🎬'},
        {'id': 'loom', 'name': 'Loom', 'url': 'https://www.loom.com', 'description': '屏幕录制和视频消息工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📹'},
        {'id': 'camtasia', 'name': 'Camtasia', 'url': 'https://www.techsmith.com/camtasia.html', 'description': '屏幕录制和视频编辑软件', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎬'},
        {'id': 'obs', 'name': 'OBS Studio', 'url': 'https://obsproject.com', 'description': '开源直播和录屏软件', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'yes', 'icon': '📹'},
        {'id': 'veed', 'name': 'VEED.IO', 'url': 'https://www.veed.io', 'description': '在线视频编辑，自动字幕和 AI 功能', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎬'},
        {'id': 'invideo', 'name': 'InVideo', 'url': 'https://invideo.io', 'description': 'AI 视频生成器，文本转视频', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎥'},
    ],
    
    # === 学习工具 (扩充到 15 个) ===
    'learn': [
        {'id': 'udemy', 'name': 'Udemy', 'url': 'https://www.udemy.com', 'description': '在线课程平台，涵盖各类技能', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎓'},
        {'id': 'masterclass', 'name': 'MasterClass', 'url': 'https://www.masterclass.com', 'description': '名人授课的高端在线课程', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎓'},
        {'id': 'skillshare', 'name': 'Skillshare', 'url': 'https://www.skillshare.com', 'description': '创意技能学习平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎨'},
        {'id': 'linkedin-learning', 'name': 'LinkedIn Learning', 'url': 'https://www.linkedin.com/learning/', 'description': '职场技能学习平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎓'},
        {'id': 'codecademy', 'name': 'Codecademy', 'url': 'https://www.codecademy.com', 'description': '交互式编程学习平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💻'},
        {'id': 'datacamp', 'name': 'DataCamp', 'url': 'https://www.datacamp.com', 'description': '数据科学在线学习平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📊'},
        {'id': 'pluralsight', 'name': 'Pluralsight', 'url': 'https://www.pluralsight.com', 'description': 'IT 和技能发展平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎓'},
        {'id': 'edx', 'name': 'edX', 'url': 'https://www.edx.org', 'description': '哈佛和 MIT 创办的在线教育平台', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎓'},
        {'id': 'futurelearn', 'name': 'FutureLearn', 'url': 'https://www.futurelearn.com', 'description': '英国在线教育平台', 'ai_type': 'traditional', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🎓'},
        {'id': 'memrise', 'name': 'Memrise', 'url': 'https://www.memrise.com', 'description': '语言学习应用，使用记忆技巧', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🌱'},
    ],
    
    # === 云服务 (扩充到 15 个) ===
    'cloud': [
        {'id': 'digitalocean', 'name': 'DigitalOcean', 'url': 'https://www.digitalocean.com', 'description': '开发者友好的云服务器平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'linode', 'name': 'Linode', 'url': 'https://www.linode.com', 'description': '云主机和云计算服务', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'heroku', 'name': 'Heroku', 'url': 'https://www.heroku.com', 'description': 'PaaS 平台，轻松部署应用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '☁️'},
        {'id': 'render', 'name': 'Render', 'url': 'https://render.com', 'description': '现代云托管平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'fly-io', 'name': 'Fly.io', 'url': 'https://fly.io', 'description': '全球分布式应用托管', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'planetscale', 'name': 'PlanetScale', 'url': 'https://planetscale.com', 'description': '可扩展的 MySQL 数据库平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🟢'},
        {'id': 'neon', 'name': 'Neon', 'url': 'https://neon.tech', 'description': '无服务器 PostgreSQL 数据库', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '💧'},
        {'id': 'upstash', 'name': 'Upstash', 'url': 'https://upstash.com', 'description': '无服务器 Redis 和 Kafka', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '⚡'},
        {'id': 'cloudinary', 'name': 'Cloudinary', 'url': 'https://cloudinary.com', 'description': '媒体资产管理和服务平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'firebase', 'name': 'Firebase', 'url': 'https://firebase.google.com', 'description': 'Google 应用开发平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '🔥'},
    ],
    
    # === 效率工具 (扩充到 15 个) ===
    'productivity': [
        {'id': 'todoist', 'name': 'Todoist', 'url': 'https://todoist.com', 'description': '跨平台任务管理工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✅'},
        {'id': 'things', 'name': 'Things 3', 'url': 'https://culturedcode.com/things/', 'description': '优雅的苹果生态任务管理', 'ai_type': 'traditional', 'ai_alternative': {'name': 'Todoist', 'url': 'https://todoist.com'}, 'automation': None, 'is_free': 'paid', 'icon': '✅'},
        {'id': 'ticktick', 'name': 'TickTick', 'url': 'https://ticktick.com', 'description': '多功能任务管理应用', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✅'},
        {'id': 'any-do', 'name': 'Any.do', 'url': 'https://www.any.do', 'description': '任务管理和日程规划', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '✅'},
        {'id': 'dropbox', 'name': 'Dropbox', 'url': 'https://www.dropbox.com', 'description': '云存储和文件同步', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📦'},
        {'id': 'box', 'name': 'Box', 'url': 'https://www.box.com', 'description': '企业云内容管理平台', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📦'},
        {'id': 'icloud', 'name': 'iCloud', 'url': 'https://www.icloud.com', 'description': 'Apple 云存储服务', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '☁️'},
        {'id': 'trello-classic', 'name': 'Notion Calendar', 'url': 'https://www.notion.so/product/calendar', 'description': 'Notion 日历，整合任务和日程', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📅'},
        {'id': 'calendly', 'name': 'Calendly', 'url': 'https://calendly.com', 'description': '智能会议预约工具', 'ai_type': 'ai-enhanced', 'ai_alternative': None, 'automation': None, 'is_free': 'freemium', 'icon': '📆'},
        {'id': 'motion', 'name': 'Motion', 'url': 'https://www.usemotion.com', 'description': 'AI 驱动的任务和日程管理', 'ai_type': 'ai-native', 'ai_alternative': None, 'automation': None, 'is_free': 'paid', 'icon': '🎬'},
    ],
}

# 合并新工具到现有数据
added_count = 0
for cat_id, new_tools in NEW_TOOLS.items():
    # 找到对应分类
    for cat in data['categories']:
        if cat['id'] == cat_id:
            for tool in new_tools:
                if tool['id'] not in existing_ids:
                    cat['tools'].append(tool)
                    existing_ids.add(tool['id'])
                    added_count += 1
            print(f"✅ {cat['name']}: 新增 {len(new_tools)} 个工具，共 {len(cat['tools'])} 个")
            break

total = sum(len(c['tools']) for c in data['categories'])
print(f"\n📊 总计: 新增 {added_count} 个工具，现有 {total} 个工具")

# 保存
with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ 已保存到 data/tools.json")
PYEOF