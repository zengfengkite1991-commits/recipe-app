# 菜品研发记录

一款功能完整的菜谱管理 PWA 应用，支持创建、编辑、分类管理、图片上传压缩、导入导出（PDF/XLSX/JSON）等功能。

## ✨ 功能特性

- 📋 **菜谱管理**：创建、编辑、删除菜谱
- 🏷️ **分类管理**：支持自定义分类（饭类、粉类、小食、主菜、冷食等）
- 🖼️ **图片上传**：封面图和步骤图，自动压缩
- 🧂 **食材调料**：分开管理，单位可自定义
- 📤 **导入导出**：支持 JSON、XLSX、PDF 格式
- 📱 **PWA 支持**：可安装到手机/电脑桌面
- 🔒 **本地存储**：数据保存在本地，安全可靠

## 🚀 部署到 GitHub Pages

### 方法一：自动部署（推荐）

1. **Fork 或创建仓库**
   - 在 GitHub 上创建一个新仓库，命名为 `recipe-app`（或其他名称）
   - 将代码推送到该仓库

2. **启用 GitHub Pages**
   - 进入仓库的 **Settings** → **Pages**
   - **Source** 选择 **GitHub Actions**

3. **自动部署**
   - 每次推送到 `main` 分支时，会自动触发部署
   - 部署完成后，访问 `https://你的用户名.github.io/recipe-app/`

### 方法二：手动部署

```bash
# 安装依赖
npm install

# 构建（GitHub Pages 模式）
GITHUB_PAGES=true npm run build

# 复制静态资源
cp -r public/* dist/

# 部署到 gh-pages 分支（需要安装 gh-pages）
npx gh-pages -d dist
```

## 📱 安装到设备

### 华为手机/鸿蒙系统
1. 用华为浏览器打开网页
2. 点击菜单 → "添加到主屏幕"

### 安卓手机（Chrome）
1. 用 Chrome 打开网页
2. 点击菜单 → "添加到主屏幕"

### iPhone（Safari）
1. 用 Safari 打开网页
2. 点击分享按钮 → "添加到主屏幕"

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
.
├── public/                 # 静态资源
│   ├── icons/             # 应用图标
│   ├── manifest.json      # PWA 配置
│   └── service-worker.js  # 服务工作线程
├── src/
│   ├── components/        # React 组件
│   ├── services/          # 业务逻辑
│   ├── types/             # TypeScript 类型
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 入口文件
├── .github/workflows/     # GitHub Actions
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
└── package.json           # 依赖配置
```

## 📝 技术栈

- **框架**：React + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **UI 组件**：shadcn/ui
- **存储**：IndexedDB
- **PWA**：Service Worker + Manifest

## 📄 许可证

MIT License
