# 📖 Xread - X/Twitter 内容收集和管理系统

一个简洁优雅的 X/Twitter 内容收集和管理系统，无需 API 访问，手动录入推文进行本地化管理。

## ✨ 功能特性

- 📝 手动录入推文（内容、作者、链接、时间等）
- 💾 SQLite 数据库存储
- 🔍 智能搜索过滤（关键词、作者、时间）
- 🏷️ 标签分类和个人笔记
- 📤 数据导出（JSON/Markdown）
- 🎨 现代化响应式界面

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 启动服务
npm start

# 或使用快速启动脚本
./start.sh
```

访问 http://localhost:3000

## 📁 项目结构

```
xread/
├── server.js           # Express 服务器
├── init-db.js          # 数据库初始化
├── package.json        # 项目配置
├── start.sh            # 快速启动脚本
└── public/             # 前端文件
    ├── index.html
    ├── style.css
    └── app.js
```

## 🗄️ 数据库 Schema

### tweets 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| tweet_id | TEXT | 推文 ID |
| author | TEXT | 作者名称 * |
| author_handle | TEXT | 作者账号 |
| content | TEXT | 推文内容 * |
| link | TEXT | 推文链接 * |
| posted_at | TEXT | 发布时间 |
| collected_at | TEXT | 收集时间 |
| tags | TEXT | 标签 |
| notes | TEXT | 个人笔记 |

## 🔌 API 接口

- `GET /api/tweets` - 获取推文列表
- `POST /api/tweets` - 添加推文
- `PUT /api/tweets/:id` - 更新推文
- `DELETE /api/tweets/:id` - 删除推文
- `GET /api/export/:format` - 导出数据
- `GET /api/stats` - 统计信息

## 📝 初始数据

支持录入以下推文链接：
- https://x.com/pamelaaaaa1218/status/2111490939604681059
- https://x.com/xaiwind/status/2111623713720508469
- https://x.com/epsaliox/status/2111644651711287513
- https://x.com/alchainhust/status/2111811721471897618

## 🛠️ 技术栈

- **后端**: Node.js + Express + SQLite
- **前端**: HTML5 + CSS3 + Vanilla JS
- **数据库**: SQLite (better-sqlite3)

## 📖 使用说明

### 添加推文

1. 点击 "➕ 添加推文"
2. 填写必填字段（链接、作者、内容）
3. 点击 "🔧 从链接自动提取" 提取 ID 和账号
4. 添加可选的标签和笔记
5. 保存

### 搜索过滤

- 关键词搜索：搜索内容、作者或笔记
- 作者筛选：按作者名称过滤
- 时间范围：选择开始和结束日期

### 导出数据

- JSON 格式：结构化数据，便于程序处理
- Markdown 格式：易读格式，便于分享

## 🔒 安全说明

- 设计为本地使用
- 无用户认证系统
- 不建议直接部署到公网

## 📄 许可证

MIT License

---

**享受使用 Xread！** 🎉
