# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 本项目：巴州区生态护林员智能管理平台（管理端 Web）

面向巴中森林防灭火组织的护林员管理后台，先做 web 端。数据走 **内存仓库 + 种子数据**（`src/data/memoryDB.ts`），无外部 DB，重启即重置。

### 分层架构（刻意分层分模块，便于后续接真实 DB / 第三方）

```
src/
├── types/          # 领域类型（Ranger/Area/Event/Course/Assessment/ExternalSystem/Org 等）
├── data/           # 数据访问层：memoryDB.ts（唯一内存仓库 + 种子数据）
├── services/       # 业务逻辑层：dashboard/ranger/area/event/training/assessment/org/utils
├── external/       # 第三方对接适配层：adapters.ts（系统注册表 + 推送/拉取适配器，占位）
├── lib/            # api.ts(请求封装) / utils.ts(cn)
├── hooks/          # use-api.ts(轻量数据 hook) / use-session.tsx(会话)
├── components/
│   ├── ui/         # shadcn/ui
│   └── admin/      # shell 布局 / sidebar / stat-card / charts / data-table / page-header
└── app/
    ├── (admin)/    # 管理后台页面：dashboard,ranger,area,warning,training,assessment,event,settings
    ├── login/      # 登录页（mock 认证）
    └── api/        # REST 路由层：auth,ranger,area,event,course,study,assessment,warning,org,external
```

### API 路由（REST，返回 `{success:true,data}` 或 `{success:false,error}`）

- 认证：`POST /api/auth/login`、`GET /api/auth/users`
- 看板：`GET /api/dashboard`
- 护林员：`GET/POST /api/ranger`、`GET/PUT/DELETE /api/ranger/[id]`
- 责任区域：`GET /api/area`、`POST /api/area`、`GET/PUT/DELETE /api/area/[id]`
- 事件：`GET/POST /api/event`、`GET/PUT /api/event/[id]`、`GET /api/event/stats`
- 培训：`GET /api/course`、`GET /api/course/[id]`、`GET /api/study`（`?rangerId=`）
- 考核：`GET /api/assessment`（`?year=&month=`）、`GET/PUT /api/assessment/rules`
- 预警：`GET /api/warning`（`?type=`）、`PUT /api/warning`（处理预警）
- 组织：`GET /api/org`（`?kind=town|village&townId=`）、`POST /api/org`
- 数据对接：`GET /api/external/systems`、`PUT /api/external/systems`（启用/停用）、`POST /api/external/integrate`（推送/拉取，占位受理）

### 第三方对接（预留层，`src/external/adapters.ts`）

系统注册表含：全国生态护林员联动（p0）、省火情监测即报（p0）、市应急管理局（p1）、市气象局（p1）、省政务数据共享平台（p2）、市河湖管理（p2）。每个系统声明 enable/direction(双向/仅出/仅入)/authType/endpoints 与 push/pull 适配器（当前为占位受理）。"数据对接"页开关会落回内存仓库 `externalSystems`。

### 登录

mock 认证，任意 admin 账号即可进入；`src/components/admin/shell.tsx` 用 use-session 判断会话，未登录跳 `/login`。

### 预览 / 部署

- 预览：`src/server.ts` 按 `COZE_PROJECT_ENV !== 'PROD'` 走 dev，`[dev]` 命令见 `.coze`，端口从 `.preview` 读（5000）。
- 部署：build.sh 产出 `.next` + `dist/server.js`，start.sh 以 `node dist/server.js` 启动并绑定 5000（需平台注入 `COZE_PROJECT_ENV=PROD`）。
