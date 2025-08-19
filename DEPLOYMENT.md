# 🚀 财务AI助手部署指南

## 📋 项目简介
财务AI助手是一个基于Next.js的现代化财务管理系统，提供AI驱动的凭证处理、财务分析等功能。

## 🌐 部署方案

### 方案1：Vercel部署（推荐）

**优点**：免费、简单、自动部署、CDN加速

**步骤**：
1. 注册 [Vercel](https://vercel.com) 账号
2. 安装Vercel CLI：
   ```bash
   npm install -g vercel
   ```
3. 登录Vercel：
   ```bash
   vercel login
   ```
4. 部署项目：
   ```bash
   vercel
   ```
5. 按提示完成配置，获得外网访问地址

### 方案2：Netlify部署

**优点**：免费、简单、支持自定义域名

**步骤**：
1. 注册 [Netlify](https://netlify.com) 账号
2. 连接GitHub仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`.next`
5. 点击部署，获得外网访问地址

### 方案3：Railway部署

**优点**：功能强大、支持数据库、自动扩展

**步骤**：
1. 注册 [Railway](https://railway.app) 账号
2. 连接GitHub仓库
3. 自动检测Next.js项目并部署
4. 获得外网访问地址

### 方案4：自建服务器部署

**优点**：完全控制、可定制化

**步骤**：
1. 购买VPS服务器（推荐：阿里云、腾讯云、DigitalOcean）
2. 连接服务器并安装Node.js：
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. 安装PM2：
   ```bash
   npm install -g pm2
   ```
4. 克隆项目：
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```
5. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
6. 启动服务：
   ```bash
   pm2 start ecosystem.config.js
   ```
7. 配置Nginx反向代理（可选）：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 本地测试

在部署前，建议先在本地测试：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动生产环境
npm start
```

## 📝 环境变量配置

如果需要配置环境变量，创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_NAME=财务AI助手
```

## 🔍 部署检查清单

- [ ] 代码已提交到Git仓库
- [ ] 本地构建测试通过
- [ ] 环境变量配置正确
- [ ] 域名解析配置（如使用自定义域名）
- [ ] SSL证书配置（如需要HTTPS）

## 🆘 常见问题

**Q: 部署后页面显示404？**
A: 检查路由配置，确保所有页面都能正确访问。

**Q: 静态资源加载失败？**
A: 检查构建输出目录配置，确保静态文件路径正确。

**Q: 部署后功能异常？**
A: 检查浏览器控制台错误，确认环境变量配置正确。

## 📞 技术支持

如遇到部署问题，请检查：
1. Node.js版本（推荐18.x）
2. 构建日志
3. 网络连接
4. 平台服务状态

---

**祝您部署顺利！** 🎉
