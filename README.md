# 卡牌召唤师 - 卡牌回合制H5游戏

一款复杂的卡牌回合制H5网页游戏，包含卡牌收集、养成进阶、阵容搭配、副本闯关、跨服竞技场、玩家交易行、限时活动等模块。

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                         H5客户端                            │
│            React + TypeScript + Vite + Zustand             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP / WebSocket
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      分布式游戏服务端                         │
│            NestJS + TypeScript + PostgreSQL + Redis         │
├───────────────┬───────────────┬───────────────┬─────────────┤
│   玩家模块     │   卡牌模块     │   战斗模块     │  副本模块    │
├───────────────┼───────────────┼───────────────┼─────────────┤
│   物品模块     │   活动模块     │   风控模块     │  运营后台    │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

## 项目结构

```
hjh528/
├── packages/
│   ├── shared/              # 共享层：类型定义、数值计算、战斗引擎
│   │   ├── src/
│   │   │   ├── types/       # 类型定义
│   │   │   ├── constants/   # 常量配置
│   │   │   ├── utils/       # 工具函数（数值计算、战斗引擎）
│   │   │   └── enums.ts     # 枚举定义
│   │   └── package.json
│   │
│   ├── server/              # 服务端：NestJS + TypeORM
│   │   ├── src/
│   │   │   ├── modules/     # 业务模块
│   │   │   │   ├── auth/       # 认证模块
│   │   │   │   ├── player/     # 玩家模块
│   │   │   │   ├── card/       # 卡牌模块
│   │   │   │   ├── battle/     # 战斗模块
│   │   │   │   ├── item/       # 物品模块
│   │   │   │   ├── stage/      # 副本模块
│   │   │   │   ├── activity/   # 活动模块
│   │   │   │   ├── risk/       # 风控模块
│   │   │   │   └── seed/       # 种子数据
│   │   │   ├── common/      # 公共组件
│   │   │   │   ├── redis/      # Redis服务
│   │   │   │   ├── filters/    # 过滤器
│   │   │   │   └── interceptors/ # 拦截器
│   │   │   ├── config/      # 配置
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── client/              # 前端：React + Vite
│       ├── src/
│       │   ├── pages/       # 页面组件
│       │   ├── components/  # 公共组件
│       │   ├── layouts/     # 布局组件
│       │   ├── store/       # 状态管理
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── docker-compose.yml       # Docker环境配置
└── package.json             # Monorepo根配置
```

## 核心功能

### 1. 多层级卡牌数值体系
- 卡牌稀有度：N → R → SR → SSR → UR
- 属性系统：HP、攻击、防御、速度、暴击、命中、闪避等
- 养成系统：等级提升、突破进阶、技能解锁
- 羁绊系统：多张特定卡牌组合激活属性加成
- 元素克制：火→风→土→水→火，光↔暗
- **所有数值计算在服务端完成，客户端仅渲染展示**

### 2. 游戏经济系统风控
- 多类货币：金币、钻石、体力、代币等独立流通
- 绑定/非绑定货币分离
- 全量货币流水记录
- 异常行为检测：批量刷资源、工作室账号、异常交易
- 自动限流、预警、封禁机制

### 3. 战斗系统
- 回合制战斗，速度决定出手顺序
- 技能系统：普攻、主动技能、被动技能、终极技能
- Buff/Debuff系统
- 护盾机制
- 元素克制伤害加成
- 完整战报回放

### 4. 副本与活动系统
- 章节制副本，难度递增
- 星级评价系统
- 活动配置热更新
- 灰度发布支持（按玩家等级/服务器/白名单）
- 限时活动、节日活动、签到活动

### 5. 数据存储与性能
- PostgreSQL 关系型数据存储
- Redis 缓存热点数据
- 玩家数据冷热分离
- 接口限流设计

## 快速开始

### 前置要求
- Node.js >= 18
- npm >= 9
- Docker（可选，用于启动数据库）

### 1. 启动数据库（可选）

```bash
docker-compose up -d
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建共享包

```bash
npm run build:shared
```

### 4. 启动服务端

```bash
# 复制环境变量配置
cp packages/server/.env.example packages/server/.env

# 启动服务端
npm run dev:server
```

服务端启动在 http://localhost:3000

### 5. 启动前端

```bash
npm run dev:client
```

前端启动在 http://localhost:5173

### 6. 同时启动前后端

```bash
npm run dev
```

## 游戏数据

首次启动服务端会自动初始化游戏数据：

- **12张卡牌**：覆盖所有稀有度和元素类型
- **29种物品**：材料、消耗品、货币等
- **3个章节**：共21个关卡
- **5个活动**：签到、新手任务、限时召唤等

## 核心技术亮点

### 数值体系
- 服务端权威计算，客户端不可篡改
- 数值配置校验，防止数值膨胀
- 稀有度梯度设计，成长曲线平滑

### 战斗引擎
- 纯函数式战斗计算，可预测可回放
- 完整的技能效果系统
- 支持复杂的Buff/Debuff叠加

### 风控系统
- 全量货币流水记录
- 异常行为检测框架
- 预留工作室账号识别接口

### 活动系统
- 配置驱动，热更新支持
- 灰度发布，降低上线风险
- 多类型活动框架

### 架构设计
- Monorepo 代码共享
- 模块化设计，易于扩展
- TypeScript 全栈类型安全
- 预留微服务拆分能力

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 当前用户信息

### 玩家
- `GET /api/players/info` - 玩家信息
- `GET /api/players/resources` - 玩家资源
- `PUT /api/players/profile` - 更新资料

### 卡牌
- `GET /api/cards/templates` - 卡牌模板列表
- `GET /api/cards/templates/:id` - 卡牌模板详情
- `GET /api/cards` - 玩家卡牌列表
- `GET /api/cards/:id` - 玩家卡牌详情
- `POST /api/cards/upgrade` - 升级卡牌
- `POST /api/cards/breakthrough` - 突破卡牌
- `GET /api/cards/lineup` - 获取阵容
- `POST /api/cards/lineup` - 设置阵容

### 战斗
- `POST /api/battle/start` - 开始战斗
- `POST /api/battle/stage` - 副本战斗
- `GET /api/battle/:id` - 战斗结果
- `GET /api/battle` - 战斗记录

### 物品
- `GET /api/items/templates` - 物品模板列表
- `GET /api/items/inventory` - 玩家背包
- `POST /api/items/use` - 使用物品

### 副本
- `GET /api/stages/chapters` - 章节列表
- `GET /api/stages` - 关卡列表
- `GET /api/stages/:id` - 关卡详情
- `GET /api/stages/progress` - 玩家进度
- `POST /api/stages/challenge` - 挑战关卡

### 活动
- `GET /api/activities` - 活动列表
- `GET /api/activities/:id` - 活动详情
- `GET /api/activities/progress` - 活动进度
- `POST /api/activities/reward` - 领取奖励

### 风控（管理）
- `GET /api/risk/events` - 风控事件列表
- `POST /api/risk/events/:id/handle` - 处理风控事件
- `POST /api/risk/player/:id/ban` - 封禁玩家
- `POST /api/risk/player/:id/unban` - 解封玩家
- `GET /api/risk/currency-logs` - 货币流水

## 开发说明

### 共享层开发

```bash
cd packages/shared
npm run dev
```

### 服务端开发

```bash
cd packages/server
npm run start:dev
```

### 前端开发

```bash
cd packages/client
npm run dev
```

### 代码规范

- 全栈 TypeScript
- 服务端 NestJS 模块化架构
- 前端 React Hooks + Zustand
- 组件化开发，保持代码复用

## 后续扩展计划

- [ ] 跨服竞技场
- [ ] 玩家交易行
- [ ] 公会系统
- [ ] 运营配置后台
- [ ] 风控监控中心
- [ ] 数据统计分析
- [ ] 客服工单系统

## 许可证

Private
