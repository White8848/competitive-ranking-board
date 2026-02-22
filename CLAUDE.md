# 竞技排行榜 - AI 工作流规范

## 项目概述
竞技排行榜是一款实时战队排名与淘汰赛预测系统，基于纯前端技术栈（HTML5 + CSS3 + JavaScript ES6+）构建，部署于 GitHub Pages。适用于电竞、体育等各类团队对抗赛事。

## 技术栈
- **HTML5** — 语义化标记，单页面入口 `index.html`
- **CSS3** — 渐变、动画、Grid/Flexbox 布局、响应式设计，单文件 `styles.css`
- **JavaScript (ES6+)** — 数据处理、DOM 操作、事件管理，单文件 `script.js`
- **Clipboard API** — 剪贴板读取（核心数据导入方式）
- **File API** — CSV 文件解析
- **LocalStorage** — 本地数据持久化（关注战队列表等）
- **无构建工具、无框架、无后端 API**，浏览器直接打开 `index.html` 即可运行

## 项目结构
```
competitive-ranking-board/
├── index.html                  # 主应用页面（排行榜 + 淘汰赛预测）
├── script.js                   # 核心业务逻辑（数据解析、排序算法、淘汰赛预测、UI 交互）
├── styles.css                  # 全局样式（响应式设计、渐变配色、动画）
├── package.json                # 项目元数据（无构建依赖）
├── .gitignore                  # Git 忽略规则
├── README.md                   # 项目文档
├── CLAUDE.md                   # AI 工作流规范（本文件）
├── TODO.md                     # 待办事项与开发路线图
├── QUICK_START.md              # 快速开始指南
├── SUMMARY.md                  # 项目总结
├── kdocs-research-report.md    # 金山文档 API 调研报告
├── kdocs-puppeteer-example.js  # Puppeteer 爬取金山文档示例
├── kdocs-selenium-example.py   # Selenium 爬取金山文档示例
├── test-access.js              # 金山文档访问测试脚本
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions 自动部署（push to master → deploy to Pages）
```

## 功能模块

### 排行榜模块
- 数据输入：剪贴板快速读取（推荐）、CSV 文件上传、手动输入
- 排名算法：胜负分 → 净胜分 → 胜场数 → 总分（多维度优先级排序）
- EPA 计算：`EPA = 总分 / 比赛场次 / 2`
- 自动刷新：10 秒 - 5 分钟可选间隔
- 重点关注：置顶展示特定战队（LocalStorage 持久化）
- 搜索与排序：实时搜索、点击表头排序

### 淘汰赛预测模块
- 首尾对战配对（排名第 1 vs 排名最后，依次类推）
- 基于联盟总 EPA 预测晋级
- 多轮分支图可视化
- 支持任意队伍数（自动轮空处理）

## 开发规范

### 代码风格
- JavaScript 使用 ES6+ 语法（`const`/`let`、箭头函数、模板字符串、解构等）
- 函数命名使用 camelCase，常量使用 UPPER_SNAKE_CASE
- DOM 元素变量统一在文件顶部获取
- 事件监听统一在 `DOMContentLoaded` 或文件底部初始化
- CSS 类名使用 kebab-case（如 `.tab-navigation`、`.btn-primary`）
- 保持单文件架构：所有 JS 逻辑在 `script.js`，所有样式在 `styles.css`

### 浏览器兼容
- Chrome/Edge 90+（推荐）
- Firefox 88+
- Safari 14+
- 移动端浏览器（iOS Safari、Chrome Mobile）

## Git 提交与推送规范
- 每完成一个独立小任务就提交
- 提交信息格式：`<type>: <description>`
- type: feat(新功能), style(样式), refactor(重构), fix(修复), chore(工具配置), docs(文档)
- 描述使用中文或英文均可，保持简洁清晰
- 示例：`feat: 添加深色模式切换功能`、`fix: 修复 EPA 计算精度问题`
- **推送时机**：所有小任务全部完成后统一 `git push`，或用户明确要求时推送

## 多人协作规范

### PR 审查流程
- AI 完成任务后创建 PR，**不直接合并到 master**
- PR 描述需包含：
  - **改动摘要**：本次改动的目的和内容概述
  - **影响范围**：涉及哪些模块/页面
  - **截图**：UI 相关变更建议附带截图
- PR 标题格式与提交信息一致：`<type>: <description>`

### 冲突预防
- **开始工作前必须同步主分支**：
  ```bash
  git fetch origin master
  git rebase origin/master
  ```
- 如有冲突，先解决冲突再开始新任务
- **高风险文件**（修改前需注意）：
  - `index.html` — 页面结构，影响全局
  - `styles.css` — 全局样式
  - `script.js` — 所有业务逻辑
  - `package.json` — 项目配置
  - `.github/workflows/deploy.yml` — 部署配置

## 任务执行流程

### 1. 规划阶段
1. 读取当前任务描述
2. **评估任务复杂度（必须输出检查清单）** — 开始任何实现之前，**必须先输出以下检查清单给用户**，不可跳过：
   ```
   ## 复杂度评估
   - [ ] 涉及修改点数: ___（≥3 个联动修改 → 复杂）
   - [ ] 是否新增页面或大型功能模块: 是/否
   - [ ] 是否涉及核心算法调整或数据结构变更: 是/否
   - [ ] 需求是否模糊，存在多种实现路径: 是/否
   → **判定结果**: 简单 / 复杂
   ```
   - 命中任意一条即判定为**复杂任务**
   - 输出清单后等待用户确认判定结果，用户可纠正
   - **禁止跳过此步骤直接开始编码**
3. **复杂任务自动启动 Plan 模式**：
   - 使用 Plan 子代理进行深度分析（代码探索、依赖梳理、方案对比）
   - 输出结构化实施计划，包含：任务拆分、修改要点、风险点
   - 计划经用户确认后再进入实现阶段
4. **简单任务直接拆分**：将任务拆分为多个独立的小任务，每个小任务应满足：
   - 有明确的完成标准
   - 可独立验证
   - 粒度适中（一个功能点、一组相关样式等）
5. 列出完整的小任务清单（包括涉及的文件、修改内容），**等待用户确认后再开始实现**
6. **创建功能分支**（如尚未在功能分支上） — 用户确认后、开始实现前：
   ```bash
   git fetch origin master
   git checkout -b <type>/<short-description> origin/master
   ```
   - 分支命名格式：`<type>/<short-description>`
   - 示例：`feat/dark-mode`、`fix/epa-calculation`、`style/responsive-playoff`
   - **禁止直接在 master 分支上开发和提交**
7. **创建任务记录文件（仅复杂任务）** — 创建 `.claude/task-log/current-task.md`，写入任务标题、分支名、计划清单和初始上下文

### 2. 迭代执行（对每个小任务循环）
1. **实现** — 完成当前小任务的代码编写
2. **验证** — 由于项目无构建工具，按以下方式验证：
   - **语法检查** — 确认 JavaScript 无语法错误（可在浏览器控制台验证）
   - **功能自测** — 在浏览器中打开 `index.html`，手动验证功能是否正常
   - **响应式检查** — 如涉及 UI 修改，确认桌面端和移动端布局正常
3. **自查** — 运行 `git diff` 审查改动，确认：
   - 无调试代码（`console.log` 用于调试的需移除，项目原有的可保留）
   - 无注释掉的代码
   - 无无关改动
4. **处理结果**：
   - **验证通过** → git commit 当前小任务，更新 `current-task.md`（如存在），进入下一个小任务
   - **验证失败** → 将问题和已尝试方案记录到 `current-task.md`（如存在），进入修复流程

### 3. 修复流程
1. 分析错误信息，定位问题原因
2. 尝试修复（最多 3 次）
3. 每次修复后重新验证
4. **修复成功** → git commit，继续下一个小任务
5. **修复失败（3 次后仍未通过）** → 执行回退：
   - `git checkout -- .` 撤销已追踪文件的修改
   - `git clean -fd` 删除新建的未追踪文件
   - 通知用户该小任务失败及原因
   - 等待用户指示（跳过 / 调整方案 / 手动介入）

### 4. 自动 Compact（上下文管理）
长任务产生大量上下文，为避免窗口溢出丢失关键信息：
- **每完成一个小任务并 commit 后**，主动执行 `/compact` 压缩上下文
- **compact 前**：确保 `current-task.md` 已更新到最新状态
- compact 后按以下清单恢复工作状态：
  1. 读取 CLAUDE.md 了解项目规范
  2. **读取 `.claude/task-log/current-task.md`**（如存在），恢复完整任务上下文
  3. 运行 `git log --oneline -10` 查看最近提交进度
  4. 读取任务清单，确认当前在第几个小任务
  5. 运行 `git status` 检查是否有未提交的改动

### 5. 大型任务记录文件机制
仅在**复杂任务**时创建记录文件，简单任务（< 3 步）不创建。

#### 文件结构
```
.claude/
└── task-log/
    ├── current-task.md      # 当前任务的实时状态（同时只存在一个）
    └── archive/             # 已完成任务的归档
        └── 2026-02-22-feat-xxx.md
```

> **注意**：`.claude/task-log/` 应加入 `.gitignore`，不纳入版本管理。

#### 记录文件模板（`current-task.md`）
```markdown
# Task: <任务标题>
- Branch: <分支名>
- Created: <创建时间>
- Status: in_progress | completed | blocked

## Plan
1. [x] 子任务 1 — 描述
2. [ ] 子任务 2 — 描述（← 当前）
3. [ ] 子任务 3 — 描述

## Progress Log
### 子任务 1 ✅
- 修改文件: script.js (行 xxx-xxx)
- 关键决策: <选择了什么方案、为什么>
- Commit: <hash>

### 子任务 2 🔧 (in progress)
- 修改文件: styles.css
- 遇到问题: <问题描述>
- 已尝试: <尝试过的方案及结果>
- 下一步: <计划的解决方向>

## Context
<!-- compact 或新 session 后需要恢复的关键信息 -->
- <跨子任务的重要上下文>
```

#### 写入原则
1. **轻量追加** — 每次只追加几行关键信息
2. **记决策不记过程** — 重点记录"选了什么、为什么"
3. **记异常不记正常** — 顺利完成的子任务只需 commit hash
4. **与 TodoWrite 互补** — TodoWrite 管理内存态进度，task-log 管理持久态上下文

## 数据格式参考

### 比赛数据表格列定义
| 列号 | 字段 | 说明 |
|------|------|------|
| 0 | 场地 | 比赛场地编号 |
| 1 | 场次 | 比赛场次编号 |
| 3 | 红方战队1名称 | |
| 5 | 红方战队2名称 | |
| 7 | 蓝方战队1名称 | |
| 9 | 蓝方战队2名称 | |
| 10 | 红方胜负分 | |
| 11 | 红方总分 | |
| 12 | 红方净胜分 | 可为负 |
| 13 | 蓝方胜负分 | |
| 14 | 蓝方总分 | |
| 15 | 蓝方净胜分 | 可为负 |

### 排名算法优先级
1. 胜负分总和 ↓（最高优先级）
2. 净胜分总和 ↓
3. 胜场数 ↓
4. 总分 ↓（最终参考）

## 部署
- GitHub Actions 自动部署（push to master → deploy to GitHub Pages）
- 纯静态文件，无构建步骤，直接上传整个仓库根目录
- 在线访问：`https://white8848.github.io/competitive-ranking-board/`
