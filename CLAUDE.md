# 竞技排行榜 - AI 工作流规范

## 项目概述
竞技排行榜是一款实时战队排名与淘汰赛预测系统，基于 React 19 + TypeScript + Vite 构建的 SPA，部署于 GitHub Pages。适用于电竞、体育等各类团队对抗赛事。

## 技术栈
- **框架**: React 19 + TypeScript 5.9
- **构建**: Vite 7.3，base 路径 `/competitive-ranking-board/`
- **样式**: CSS Modules + CSS 变量
- **Clipboard API** — 剪贴板读取（核心数据导入方式）
- **File API** — CSV 文件解析
- **LocalStorage** — 本地数据持久化（关注战队列表等）
- **无状态管理库、无路由、无后端 API**，所有数据为本地状态

## 项目结构
```
competitive-ranking-board/
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目依赖与脚本
├── src/
│   ├── main.tsx                # React 挂载入口
│   ├── App.tsx                 # 根组件（状态管理中心）
│   ├── App.module.css          # 根组件样式
│   ├── index.css               # 全局样式（reset、字体）
│   ├── types/index.ts          # TypeScript 类型定义
│   ├── data/sampleData.ts      # 示例数据
│   ├── utils/
│   │   ├── dataParser.ts       # 表格/CSV 数据解析
│   │   ├── rankingAlgorithm.ts # 排名算法与排序
│   │   ├── playoffGenerator.ts # 淘汰赛赛程生成
│   │   └── escapeHtml.ts       # HTML 转义
│   ├── hooks/
│   │   ├── useNotification.ts  # 通知管理
│   │   ├── useFeaturedTeams.ts # 关注战队管理（LocalStorage）
│   │   └── useAutoRefresh.ts   # 自动刷新定时器
│   └── components/
│       ├── layout/             # Header, Footer, TabNavigation
│       ├── data-input/         # DataControls, DataInputPanel
│       ├── ranking/            # StatsCards, FeaturedTeams, SearchBox, RankingTable
│       ├── playoff/            # PlayoffView
│       └── ui/                 # Modal, Notification
├── .claude/skills/             # Claude Code Skills
│   ├── commit/SKILL.md
│   ├── review-code/SKILL.md
│   ├── refactor/SKILL.md
│   └── deploy/SKILL.md
├── .github/workflows/deploy.yml
└── [legacy files]              # 旧版文件保留供参考
```

## 开发规范
- 组件使用函数式组件 + TypeScript，状态管理仅用 React Hooks
- 样式使用 CSS Modules，文件命名 `ComponentName.module.css`
- 业务逻辑抽离到 `utils/`，状态逻辑抽离到 `hooks/`
- 组件按功能分组在 `components/` 子目录

## 常用命令
- `npm run dev` — 启动开发服务器（Vite HMR）
- `npm run build` — TypeScript 检查 + 生产构建
- `npm run lint` — ESLint 代码检查
- `npm run preview` — 预览生产构建

## Git 工作流

### 提交规范
- 每完成一个独立小任务就提交
- 提交信息格式：`<type>: <description>`
- type: feat / style / refactor / fix / chore / docs

### 分支与合并
- 在功能分支上开发，**禁止直接在 master 上提交**
- **创建 PR 后自动合并**，合并后自动删除远程功能分支
- 完整流程：push → `gh pr create` → `gh pr merge --merge --delete-branch` → 切回 master

## 任务执行流程

### 1. 规划阶段
1. 评估复杂度（输出检查清单），复杂任务启动 Plan 模式
2. 列出小任务清单，等待用户确认
3. 创建功能分支

### 2. 迭代执行
1. 实现 → 运行 `npm run build` 验证 → 自查 `git diff` → 提交

### 3. 完成阶段
1. `git push` → 创建 PR → 自动合并 → 删除分支 → 切回 master

### 4. 修复流程
最多 3 次修复尝试，失败则回退并通知用户

### 5. 大型任务记录（仅复杂任务）
`.claude/task-log/current-task.md` — 已加入 `.gitignore`

## 数据格式参考

### 排名算法优先级
1. 胜负分总和 ↓（最高优先级）
2. 净胜分总和 ↓
3. 胜场数 ↓
4. 总分 ↓（最终参考）

## 部署
- GitHub Actions 自动部署（push to master → npm ci → build → deploy dist/）
- 在线访问：`https://white8848.github.io/competitive-ranking-board/`
