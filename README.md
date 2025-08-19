# AI财务系统 - 智能财务管理平台

## 项目概述

AI财务系统是一个基于React + Next.js开发的现代化财务管理平台，以AI为核心，通过智能对话的方式实现自动凭证处理、自动记账、自动对账与试算平衡、自动编写财务报表、自动纳税申报与归档、自动开票、自动付款、风险提示等功能。

## 核心特性

### 🤖 AI驱动
- **智能对话**: 通过自然语言与AI助手交互，获取财务建议和自动处理
- **自动分析**: AI自动分析财务状况，识别异常和风险点
- **智能推荐**: 基于历史数据和趋势提供个性化建议
- **自动处理**: 自动生成凭证、报表、发票等财务文档

### 📊 财务管理
- **凭证管理**: 自动创建、编辑和管理财务凭证
- **科目管理**: 灵活的会计科目体系管理
- **对账功能**: 自动对账和试算平衡
- **报表生成**: 自动生成资产负债表、利润表、现金流量表等
- **发票管理**: 自动生成和跟踪发票
- **付款处理**: 自动处理收付款事务

### ⚠️ 风险控制
- **风险预警**: 实时监控财务风险，及时预警
- **异常检测**: AI自动识别异常交易和财务风险
- **合规检查**: 自动检查财务合规性
- **审计支持**: 提供完整的审计追踪

### 🏢 税务管理
- **自动申报**: 自动生成和提交税务申报表
- **税费计算**: 自动计算各种税费
- **申报跟踪**: 跟踪税务申报状态
- **合规提醒**: 及时提醒税务截止日期

### 🔌 MCP应用中心
- **应用集成**: 支持各种财务工具和服务的集成
- **插件管理**: 灵活的插件安装和管理
- **API连接**: 支持银行、税务、发票等第三方服务
- **数据同步**: 自动同步外部数据

## 技术架构

### 前端技术栈
- **React 18**: 现代化的React框架
- **Next.js 14**: 全栈React框架，支持SSR和SSG
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 实用优先的CSS框架
- **Framer Motion**: 流畅的动画库
- **Zustand**: 轻量级状态管理
- **React Hook Form**: 表单处理
- **Recharts**: 数据可视化图表
- **Lucide React**: 现代化图标库

### 项目结构
```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面（仪表板）
│   ├── ai-chat/           # AI对话页面
│   └── mcp-apps/          # MCP应用中心
├── components/            # 可复用组件
├── data/                  # Mock数据
│   └── mockData.ts       # 模拟数据定义
├── lib/                   # 工具库
│   └── mockApi.ts        # Mock API实现
├── store/                 # 状态管理
│   └── index.ts          # Zustand状态定义
├── types/                 # TypeScript类型定义
│   ├── index.ts          # 主要类型定义
│   └── api.ts            # API接口类型
├── utils/                 # 工具函数
│   └── index.ts          # 通用工具函数
└── public/               # 静态资源
```

## 核心功能模块

### 1. 仪表板 (Dashboard)
- 财务概览和关键指标
- 实时数据可视化
- 快速操作入口
- 风险预警和提醒

### 2. AI对话 (AI Chat)
- 自然语言交互
- 智能财务咨询
- 自动操作执行
- 上下文理解

### 3. 凭证管理 (Transactions)
- 自动凭证生成
- 批量处理
- 审核流程
- 历史记录

### 4. 科目管理 (Accounts)
- 科目体系管理
- 余额查询
- 对账功能
- 科目分析

### 5. 发票管理 (Invoices)
- 自动开票
- 发票跟踪
- 付款管理
- 催款提醒

### 6. 财务报表 (Reports)
- 自动生成报表
- 多格式导出
- 报表分析
- 趋势预测

### 7. 风险预警 (Risk Alerts)
- 实时监控
- 风险评分
- 预警通知
- 处理建议

### 8. 税务申报 (Tax Filings)
- 自动申报
- 税费计算
- 申报跟踪
- 合规检查

### 9. 付款管理 (Payments)
- 自动付款
- 付款计划
- 银行集成
- 付款跟踪

### 10. 客户管理 (Contacts)
- 客户信息管理
- 供应商管理
- 联系记录
- 信用评估

### 11. MCP应用中心 (MCP Apps)
- 应用市场
- 插件管理
- 集成配置
- 数据同步

## 数据模型

### 核心实体
- **User**: 用户信息
- **Account**: 会计科目
- **Transaction**: 财务凭证
- **Invoice**: 发票
- **Contact**: 客户/供应商
- **FinancialReport**: 财务报表
- **AIConversation**: AI对话
- **MCPApp**: MCP应用
- **RiskAlert**: 风险预警
- **TaxFiling**: 税务申报
- **Payment**: 付款记录

### 类型系统
项目使用完善的TypeScript类型定义，包括：
- 基础实体类型
- 枚举类型
- API接口类型
- 状态管理类型
- 工具函数类型

## 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
cd frontend
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript严格模式
- 使用Tailwind CSS进行样式开发

## Mock数据

项目使用完善的Mock数据系统：
- 所有数据都通过TypeScript接口定义
- 通过Mock API服务加载数据
- 支持CRUD操作和复杂查询
- 模拟真实的API延迟和错误处理

## 状态管理

使用Zustand进行状态管理：
- 用户状态
- AI对话状态
- 风险预警状态
- UI状态
- 加载状态
- 错误状态
- 搜索和过滤状态
- 分页状态
- 选择状态
- 模态框状态
- 通知状态

## 样式系统

基于Tailwind CSS的现代化样式系统：
- 响应式设计
- 深色模式支持
- 组件化样式
- 动画效果
- 渐变背景
- 玻璃效果

## 性能优化

- 代码分割和懒加载
- 图片优化
- 缓存策略
- 虚拟滚动
- 防抖和节流
- 内存管理

## 安全特性

- 类型安全
- 输入验证
- XSS防护
- CSRF防护
- 权限控制
- 数据加密

## 部署

### 静态部署
```bash
npm run build
npm run export
```

### 服务器部署
```bash
npm run build
npm start
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 功能建议: [Discussions]

---

**AI财务系统** - 让财务管理更智能、更高效！
