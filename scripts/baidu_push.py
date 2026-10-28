#!/usr/bin/env python3
"""
百度主动推送脚本
用法：python baidu_push.py
- 百度主动推送每日限额 10 条（免费账户）
- 每天只推送 10 条新 URL，轮询推送全站
- 状态记录在 data/.baidu_push_state.json
"""

import json
import subprocess
import tempfile
import os
from datetime import datetime

# ==================== 配置 ====================
# 脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BAIDU_TOKEN = "nZevy1hrzSC0jxkO"  # 百度站长平台获取
SITE_URL = "https://yingjideng.dpdns.org"
DATA_FILE = os.path.join(SCRIPT_DIR, "..", "data", "tools.json")
STATE_FILE = os.path.join(SCRIPT_DIR, "..", "data", ".baidu_push_state.json")
DAILY_LIMIT = 10  # 百度每日推送限额（免费账户）
# ============================================

def load_tools():
    """加载工具数据"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def generate_urls():
    """生成所有需要推送的 URL（去重后排序，保证顺序稳定）"""
    urls = []

    # 首页
    urls.append(SITE_URL + "/")
    urls.append(SITE_URL + "/index.html")

    # 分类页
    categories = [
        'dev', 'design', 'office', 'video', 'learn', 'cloud',
        'productivity', 'data', 'ai-models', 'ai-writing',
        'ai-presentation', 'ai-scheduling', 'ai-meeting',
        'ai-social', 'ai-coding', 'ai-search', 'ai-image',
        'ai-voice', 'ai-no-code', 'ai-devops'
    ]
    for cat in categories:
        urls.append(f"{SITE_URL}/category.html?category={cat}")

    # 工具详情页
    data = load_tools()
    for cat in data['categories']:
        for tool in cat['tools']:
            urls.append(f"{SITE_URL}/tool.html?id={tool['id']}")

    # 其他页面
    urls.extend([
        f"{SITE_URL}/favorites.html",
        f"{SITE_URL}/sitemap.html",
    ])

    # 去重（首页 / 和 /index.html 视为同一页面，只保留一个）
    seen = set()
    unique_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique_urls.append(u)

    return unique_urls

def load_state():
    """加载推送状态"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"pushed": [], "index": 0, "last_push_date": None}

def save_state(state):
    """保存推送状态"""
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def push_to_baidu(urls):
    """推送 URL 到百度"""
    if not urls:
        print("⚠️ 没有 URL 需要推送")
        return 0

    api_url = f"https://data.zz.baidu.com/urls?site={SITE_URL}&token={BAIDU_TOKEN}"

    # 百度单次最多推送 2000 条，但我们每天只推 10 条
    batch_size = 2000
    total_pushed = 0

    for i in range(0, len(urls), batch_size):
        batch = urls[i:i+batch_size]
        body = "\n".join(batch)

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp:
            tmp.write(body)
            tmp_path = tmp.name

        try:
            curl_cmd = f'curl -sk -X POST "{api_url}" --data-binary "@{tmp_path}"'
            result = subprocess.run(curl_cmd, shell=True, capture_output=True, text=True, timeout=60)
            response = result.stdout.strip()

            if response:
                try:
                    data = json.loads(response)
                    if 'success' in data:
                        total_pushed += data['success']
                        print(f"✅ 推送 {data['success']} 条成功，剩余额度 {data.get('remain', 'N/A')}")
                    else:
                        print(f"⚠️ {data.get('message', '未知错误')}")
                        print(f"   响应: {response}")
                except json.JSONDecodeError:
                    print(f"⚠️ 响应非 JSON - {response}")
            else:
                print(f"❌ 推送失败 - 无响应")
                if result.stderr:
                    print(f"   错误: {result.stderr[:200]}")
        except Exception as e:
            print(f"❌ 推送失败 - {e}")
        finally:
            os.unlink(tmp_path)

    return total_pushed

def main():
    today = datetime.now().strftime("%Y-%m-%d")
    state = load_state()

    # 如果今天已经推过，跳过
    if state.get("last_push_date") == today:
        print(f"ℹ️ 今天（{today}）已推送过，跳过")
        return

    print(f"🔍 生成 URL 列表...")
    all_urls = generate_urls()
    print(f"   全站共 {len(all_urls)} 条唯一 URL")

    # 找出还没推过的 URL
    pushed_set = set(state.get("pushed", []))
    remaining = [u for u in all_urls if u not in pushed_set]
    print(f"   待推送 {len(remaining)} 条")

    if not remaining:
        print("ℹ️ 全站 URL 已全部推送完毕")
        # 可选：重置状态，开始第二轮轮询
        # state["pushed"] = []
        # state["index"] = 0
        # save_state(state)
        return

    # 每天只推 DAILY_LIMIT 条
    to_push = remaining[:DAILY_LIMIT]
    print(f"\n📤 今日推送 {len(to_push)} 条（限额 {DAILY_LIMIT}）...")
    print(f"   站点: {SITE_URL}")
    print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    for u in to_push:
        print(f"   → {u}")

    print()
    pushed = push_to_baidu(to_push)

    # 更新状态
    state["pushed"].extend(to_push)
    state["index"] = state.get("index", 0) + len(to_push)
    state["last_push_date"] = today
    save_state(state)

    if pushed > 0:
        print(f"\n✨ 今日推送完成！剩余 {len(remaining) - len(to_push)} 条待推")
        print(f"   累计已推送 {len(state['pushed'])} 条，预计 {(len(all_urls) / DAILY_LIMIT):.0f} 天推完全站")
    else:
        print(f"\n❌ 推送失败，请检查 BAIDU_TOKEN 是否正确")

if __name__ == "__main__":
    main()
