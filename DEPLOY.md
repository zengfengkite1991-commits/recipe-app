# 🚀 GitHub Pages 部署指南

## 快速部署步骤

### 第一步：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 **+** → **New repository**
3. 仓库名称填写 `recipe-app`（或其他你喜欢的名称）
4. 选择 **Public**（公开）
5. 点击 **Create repository**

### 第二步：上传代码

#### 方式 A：使用 Git 命令行

```bash
# 进入项目目录
cd /mnt/okcomputer/output/app

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/recipe-app.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

#### 方式 B：直接上传文件

1. 在 GitHub 仓库页面，点击 **uploading an existing file**
2. 将项目所有文件（不包括 `node_modules` 和 `dist` 文件夹）拖拽上传
3. 点击 **Commit changes**

### 第三步：启用 GitHub Pages

1. 进入仓库的 **Settings** 标签
2. 左侧菜单点击 **Pages**
3. **Source** 部分选择 **GitHub Actions**
4. 等待几分钟，部署完成后会显示访问链接

### 第四步：访问网站

部署完成后，访问地址为：
```
https://YOUR_USERNAME.github.io/recipe-app/
```

## 🔧 使用自定义域名（可选）

如果你想使用自己的域名（如 `recipe.yourdomain.com`）：

1. 在 `public` 文件夹中创建 `CNAME` 文件，内容为你的域名：
   ```
   recipe.yourdomain.com
   ```

2. 修改 `vite.config.ts`：
   ```ts
   base: '/',  // 改为根路径
   ```

3. 在你的域名 DNS 设置中添加 CNAME 记录：
   - 主机记录：`recipe`（或你选择的子域名）
   - 记录值：`YOUR_USERNAME.github.io`

4. 在 GitHub Pages 设置中，**Custom domain** 填入你的域名并保存

## 📁 需要上传的文件

必须上传的文件和文件夹：
```
.github/          # GitHub Actions 工作流
public/           # 静态资源（图标、manifest等）
src/              # 源代码
components.json   # shadcn/ui 配置
index.html        # HTML 模板
package.json      # 依赖配置
tsconfig*.json    # TypeScript 配置
vite.config.ts    # Vite 配置
tailwind.config.js
postcss.config.js
README.md
.gitignore
```

不需要上传的（已在 .gitignore 中排除）：
```
node_modules/     # 依赖文件夹
dist/             # 构建输出
```

## 🔄 自动部署

配置完成后，每次推送到 `main` 分支都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push origin main
```

GitHub Actions 会自动构建并部署到 Pages。

## 🐛 常见问题

### 1. 页面空白或 404

检查 `vite.config.ts` 中的 `base` 配置是否与仓库名称一致：
```ts
base: '/recipe-app/',  // 必须与仓库名一致
```

### 2. 图标不显示

确保 `public/icons/` 文件夹已上传到 GitHub。

### 3. 部署失败

查看 **Actions** 标签页的构建日志，检查错误信息。

### 4. 修改后没有更新

- GitHub Pages 有缓存，可能需要几分钟生效
- 尝试强制刷新页面：`Ctrl + F5`（Windows）或 `Cmd + Shift + R`（Mac）

## 📞 获取帮助

如有问题，可以：
1. 查看 [GitHub Pages 文档](https://docs.github.com/zh/pages)
2. 检查项目的 **Actions** 标签页查看部署日志
3. 在 GitHub Issues 中提问
