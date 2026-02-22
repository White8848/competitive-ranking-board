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

## Git 工作流

### 提交规范
- 每完成一个独立小任务就提交
- 提交信息格式：`<type>: <description>`
- type: feat / style / refactor / fix / chore / docs
- 示例：`feat: 添加深色模式切换功能`、`fix: 修复 EPA 计算精度问题`

### 分支与合并
- 在功能分支上开发，**禁止直接在 master 上提交**
- 所有小任务完成后统一 `git push`
- **创建 PR 后自动合并**：PR 创建即合并到 master，不等待人工审查
- **合并后自动清理**：删除远程功能分支，本地切回 master 并拉取最新代码
- 完整流程：
  ```bash
  # 1. 推送功能分支
  git push -u origin <branch-name>
  # 2. 创建 PR 并立即合并
  gh pr create --title "<type>: <desc>" --body "<summary>" && gh pr merge --merge --delete-branch
  # 3. 本地切回 master
  git checkout master && git pull origin master
  ```

### 冲突预防
- 开始工作前同步主分支：`git fetch origin master && git rebase origin/master`
- 如有冲突，先解决冲突再开始新任务

## 任务执行流程

### 1. 规划阶段
1. 读取当前任务描述
2. **评估任务复杂度** — 开始实现前，输出检查清单给用户：
   ```
   ## 复杂度评估
   - [ ] 涉及修改点数: ___（≥3 个联动修改 → 复杂）
   - [ ] 是否新增页面或大型功能模块: 是/否
   - [ ] 是否涉及核心算法调整或数据结构变更: 是/否
   - [ ] 需求是否模糊，存在多种实现路径: 是/否
   → **判定结果**: 简单 / 复杂
   ```
   - 命中任意一条即判定为**复杂任务**，自动启动 Plan 模式
   - **禁止跳过此步骤直接开始编码**
3. 列出小任务清单，**等待用户确认后再开始实现**
4. 创建功能分支：`git checkout -b <type>/<short-description> origin/master`

### 2. 迭代执行（对每个小任务循环）
1. **实现** — 完成代码编写
2. **自查** — `git diff` 审查改动，确认无调试代码、无注释掉的代码、无无关改动
3. **提交** — git commit，进入下一个小任务

### 3. 完成阶段
1. 所有小任务完成后，`git push` 推送功能分支
2. 创建 PR → **自动合并** → **删除远程分支**
3. 本地切回 master 并拉取最新代码

### 4. 修复流程
1. 尝试修复（最多 3 次）
2. **修复成功** → git commit，继续
3. **修复失败** → 回退改动，通知用户，等待指示

### 5. 自动 Compact（上下文管理）
长任务中，每完成一个小任务并 commit 后，主动执行 `/compact`。compact 后恢复：
1. 读取 CLAUDE.md
2. 读取 `.claude/task-log/current-task.md`（如存在）
3. `git log --oneline -10` + `git status`
4. 确认当前进度

### 6. 大型任务记录文件（仅复杂任务）
```
.claude/
└── task-log/
    ├── current-task.md      # 当前任务实时状态
    └── archive/             # 已完成任务归档
```
- 轻量追加，记决策不记过程，记异常不记正常
- `.claude/task-log/` 已加入 `.gitignore`

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
