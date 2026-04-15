# 🚀 GitHub Pages 完整部署指南

## 📁 一、需要上传的文件

### ✅ 必须上传的文件

```
recipe-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 自动部署配置（必需）
├── public/
│   ├── icons/                  # 应用图标
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── manifest.json           # PWA 配置
│   └── service-worker.js       # 离线缓存
├── src/
│   ├── components/             # React 组件
│   │   ├── CategoryManager.tsx
│   │   ├── HomePage.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── RecipeForm.tsx
│   │   └── UnitManager.tsx
│   ├── services/               # 业务逻辑
│   │   ├── exportService.ts
│   │   ├── imageCompression.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts            # 类型定义
│   ├── App.tsx                 # 主应用
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── index.html                  # HTML 模板
├── package.json                # 依赖配置
├── vite.config.ts              # Vite 构建配置
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── tsconfig.json               # TypeScript 配置
├── components.json             # shadcn/ui 配置
├── .gitignore                  # Git 忽略规则
└── README.md                   # 项目说明
```

### ❌ 不需要上传的文件

```
node_modules/       # 依赖文件夹（npm install 会自动生成）
dist/              # 构建输出（GitHub Actions 会自动生成）
.git/              # Git 仓库数据
```

> 💡 **提示**：这些文件已在 `.gitignore` 中配置，不会误传

---

## 📤 二、上传到 GitHub 的详细步骤

### 方法一：网页直接上传（最简单，适合新手）

#### 第 1 步：创建 GitHub 仓库

1. 打开 [github.com](https://github.com) 并登录
2. 点击右上角 **+** → **New repository**
   ![创建仓库](https://docs.github.com/assets/images/help/repository/repo-create.png)
3. 填写信息：
   - **Repository name**: `recipe-app`（或你喜欢的名字）
   - **Description**: 菜品研发记录 - 管理您的菜谱
   - **Public** ✅（必须选公开，GitHub Pages 免费版只支持公开仓库）
   - **Add a README file**: ❌ 不勾选（我们已有 README.md）
4. 点击 **Create repository**

#### 第 2 步：上传文件

1. 在新创建的仓库页面，点击 **"uploading an existing file"**
   ![上传文件](https://docs.github.com/assets/images/help/repository/upload-files-button.png)

2. 打开你电脑上的文件管理器
3. 找到解压后的 `recipe-app` 文件夹
4. **选择所有文件和文件夹**（除了 `node_modules` 和 `dist`）
5. 拖拽到 GitHub 网页的上传区域，或点击 **choose your files** 选择

6. 等待上传完成（约 10-30 秒）

7. 在 **Commit changes** 区域填写：
   - 第一个输入框：`Initial commit`
   - 第二个输入框：`首次提交菜品研发记录应用`

8. 点击 **Commit changes**

#### 第 3 步：启用 GitHub Pages

1. 点击仓库顶部的 **Settings** 标签
   ![设置](https://docs.github.com/assets/images/help/repository/repo-actions-settings.png)

2. 左侧菜单点击 **Pages**
   ![Pages 设置](https://docs.github.com/assets/images/help/pages/pages-menu.png)

3. **Source** 部分：
   - 选择 **Deploy from a branch**
   - **Branch**: 选择 `main`（或 `master`）
   - **Folder**: 选择 `/(root)`
   - 点击 **Save**

4. 等待 1-3 分钟

5. 页面会显示：
   ```
   Your site is live at https://你的用户名.github.io/recipe-app/
   ```

6. 点击链接即可访问！🎉

---

### 方法二：命令行上传（适合有 Git 基础的用户）

#### 第 1 步：安装 Git

- Windows: [下载 Git](https://git-scm.com/download/win)
- Mac: `brew install git`
- Linux: `sudo apt install git`

#### 第 2 步：配置 Git

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

#### 第 3 步：初始化并上传

```bash
# 进入项目文件夹
cd recipe-app

# 初始化 Git 仓库
git init

# 添加所有文件（.gitignore 中排除的不会添加）
git add .

# 提交
git commit -m "Initial commit: 菜品研发记录应用"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/recipe-app.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

#### 第 4 步：启用 GitHub Pages

同上「方法一」的第 3 步

---

## 🔄 三、后续更新版本的方法

### 场景 1：使用网页上传的后续更新

#### 方法 A：直接编辑单个文件（适合小修改）

1. 打开 GitHub 仓库页面
2. 找到要修改的文件
3. 点击文件右上角的 **铅笔图标** ✏️
4. 修改代码
5. 滚动到页面底部
6. 填写更新说明：
   - 第一个框：`修复了 XX 问题` 或 `添加了 XX 功能`
   - 第二个框：详细描述（可选）
7. 点击 **Commit changes**
8. GitHub Pages 会自动重新部署（约 1-2 分钟）

#### 方法 B：重新上传整个文件夹（适合大更新）

1. 在电脑上修改好代码
2. 打开 GitHub 仓库
3. 点击 **Add file** → **Upload files**
4. 上传修改后的文件
5. 勾选 **Commit directly to the main branch**
6. 点击 **Commit changes**

---

### 场景 2：使用命令行的后续更新

```bash
# 进入项目文件夹
cd recipe-app

# 查看修改了哪些文件
git status

# 添加修改的文件
git add .

# 提交（写清楚修改内容）
git commit -m "修复：食材份量可以为空"

# 推送到 GitHub
git push origin main
```

---

## 📋 四、更新版本的标准流程（推荐）

### 每次更新都这样做：

```bash
# 1. 进入项目目录
cd recipe-app

# 2. 查看当前状态
git status

# 3. 添加所有修改
git add .

# 4. 提交（写清楚做了什么）
git commit -m "更新说明：
- 修复了 XX bug
- 添加了 XX 功能
- 优化了 XX 界面"

# 5. 推送到 GitHub
git push origin main

# 6. 等待 1-2 分钟，GitHub Pages 自动部署
# 7. 刷新网页查看效果
```

---

## 🐛 五、常见问题排查

### 问题 1：网页显示空白

**检查步骤：**
1. 按 F12 打开浏览器控制台
2. 查看 Console 是否有红色错误
3. 查看 Network 是否有 404 错误

**常见原因：**
- 文件没上传完整 → 重新上传
- 路径问题 → 检查 vite.config.ts 中的 `base` 配置

### 问题 2：GitHub Pages 没有自动更新

**解决方法：**
1. 进入仓库的 **Actions** 标签
2. 查看最新的部署状态
3. 如果有红色 ❌，点击查看错误日志

### 问题 3：图标不显示

**检查：**
- `public/icons/` 文件夹是否上传
- `manifest.json` 中的路径是否正确

---

## 💡 六、最佳实践

### 提交信息规范

```bash
# ✅ 好的提交信息
git commit -m "添加：食材份量支持为空"
git commit -m "修复：分类删除后页面报错"
git commit -m "优化：图片压缩速度提升 50%"

# ❌ 不好的提交信息
git commit -m "update"
git commit -m "fix"
git commit -m "123"
```

### 版本号管理

在 `package.json` 中管理版本：
```json
{
  "name": "recipe-app",
  "version": "1.2.0",  // 主版本.次版本.修订号
  ...
}
```

- **主版本**：重大更新，不兼容旧版本
- **次版本**：新增功能，兼容旧版本
- **修订号**：bug 修复

---

## 📞 需要帮助？

如果在部署过程中遇到问题，请告诉我：
1. 你的 GitHub 用户名
2. 仓库名称
3. 具体的错误信息或截图

我可以帮你远程排查！
