# 🚀 财务AI助手自动部署指南

## 📋 项目信息
- **GitHub仓库**: https://github.com/GMarry1/finance-agent.git
- **项目类型**: Next.js 14 财务管理系统
- **主要功能**: AI驱动的凭证处理、财务分析、附件管理

## 🌐 自动部署方案

### 方案1：Vercel自动部署（推荐）

#### 步骤1：连接Vercel
1. 访问 [Vercel](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择仓库：`GMarry1/finance-agent`
5. 配置部署设置：
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
6. 点击 "Deploy"

#### 步骤2：配置环境变量（可选）
在Vercel项目设置中添加：
```
NEXT_PUBLIC_APP_NAME=财务AI助手
NEXT_PUBLIC_VERSION=1.0.0
```

#### 步骤3：自定义域名（可选）
1. 在Vercel项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 配置DNS解析

### 方案2：Netlify自动部署

#### 步骤1：连接Netlify
1. 访问 [Netlify](https://netlify.com)
2. 使用GitHub账号登录
3. 点击 "New site from Git"
4. 选择仓库：`GMarry1/finance-agent`
5. 配置构建设置：
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: .next
   ```

### 方案3：Railway自动部署

#### 步骤1：连接Railway
1. 访问 [Railway](https://railway.app)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择仓库：`GMarry1/finance-agent`
6. 自动检测Next.js项目并部署

## 🔄 自动部署工作流

### GitHub Actions配置
项目已配置自动部署工作流：`.github/workflows/deploy.yml`

**触发条件**：
- 推送到 `main` 分支
- 创建Pull Request到 `main` 分支

**部署流程**：
1. 检出代码
2. 设置Node.js 18环境
3. 安装依赖
4. 构建项目
5. 部署到Vercel

### 一键部署脚本
使用 `deploy-to-production.sh` 脚本：

```bash
# 给脚本执行权限
chmod +x deploy-to-production.sh

# 执行部署
./deploy-to-production.sh
```

**脚本功能**：
- 自动检查未提交的更改
- 自动提交代码
- 推送到GitHub
- 触发自动部署

## 📱 日常使用流程

### 开发新功能
1. 在本地开发
2. 测试功能
3. 运行部署脚本：
   ```bash
   ./deploy-to-production.sh
   ```
4. 等待2-3分钟，自动部署完成

### 查看部署状态
- **GitHub Actions**: https://github.com/GMarry1/finance-agent/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Netlify Dashboard**: https://app.netlify.com
- **Railway Dashboard**: https://railway.app/dashboard

## 🔧 故障排除

### 部署失败
1. 检查GitHub Actions日志
2. 确认构建命令正确
3. 检查依赖是否完整
4. 验证环境变量配置

### 页面无法访问
1. 检查域名配置
2. 确认DNS解析正确
3. 查看平台服务状态
4. 检查SSL证书

### 功能异常
1. 检查浏览器控制台错误
2. 验证API端点配置
3. 确认环境变量设置
4. 查看服务器日志

## 📊 监控和维护

### 性能监控
- Vercel Analytics
- Google Analytics
- 自定义性能指标

### 错误监控
- Sentry集成
- 平台内置错误报告
- 用户反馈收集

### 定期维护
- 依赖更新
- 安全补丁
- 性能优化
- 功能迭代

## 🎯 最佳实践

### 代码管理
- 使用语义化提交信息
- 定期合并主分支
- 代码审查流程
- 自动化测试

### 部署策略
- 蓝绿部署
- 渐进式发布
- 回滚机制
- 监控告警

### 安全考虑
- HTTPS强制
- 环境变量加密
- 访问控制
- 定期安全审计

## 📞 技术支持

### 平台支持
- **Vercel**: https://vercel.com/support
- **Netlify**: https://www.netlify.com/support/
- **Railway**: https://docs.railway.app/support

### 项目维护
- 定期更新依赖
- 监控部署状态
- 用户反馈处理
- 功能迭代规划

---

**🎉 恭喜！您的财务AI助手现在已经支持自动部署了！**

每次推送代码到GitHub，都会自动触发部署，让您的外网访问始终保持最新状态。
