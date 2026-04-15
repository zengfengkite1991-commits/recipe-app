# 📤 GitHub 上传的 3 种方法

## 方法一：网页拖拽上传（最简单）

### 步骤：

1. **解压 zip 文件**
   - 右键点击 `recipe-app-upload.zip`
   - 选择"解压到当前文件夹"
   - 会得到一堆文件和文件夹（src、public、.github 等）

2. **全选所有内容**
   - 按 `Ctrl + A` 全选
   - 或者鼠标框选所有

3. **拖拽到 GitHub**
   - 打开浏览器，进入你的 GitHub 仓库
   - 点击 **"uploading an existing file"**
   - 把全选的文件**一次性拖拽**到网页上传区域
   - 等待上传完成

4. **提交**
   - 填写提交信息：`Initial commit`
   - 点击 **Commit changes**

> ⚠️ 注意：如果文件太多，可能需要分批上传。先上传文件夹少的（如 src、public），再上传单个文件。

---

## 方法二：使用 GitHub Desktop（推荐）

### 下载安装
- 访问 https://desktop.github.com/
- 下载安装 GitHub Desktop

### 使用步骤

1. **登录 GitHub Desktop**
   - 打开软件，登录你的 GitHub 账号

2. **克隆仓库**
   - 点击 **File** → **Clone repository**
   - 选择你创建的 `recipe-app` 仓库
   - 选择本地保存路径（如 `C:\Users\你的用户名\Documents\GitHub\recipe-app`）

3. **复制文件**
   - 解压 `recipe-app-upload.zip`
   - 把解压后的**所有文件**复制到克隆的文件夹

4. **提交并推送**
   - GitHub Desktop 会自动检测到变化
   - 填写提交信息：`Initial commit`
   - 点击 **Commit to main**
   - 点击 **Push origin**

✅ 完成！以后更新只需要重复步骤 3-4

---

## 方法三：命令行（最快）

### Windows 步骤：

1. **安装 Git**
   - 访问 https://git-scm.com/download/win
   - 下载安装，一路下一步

2. **打开命令行**
   - 按 `Win + R`，输入 `cmd`，回车

3. **执行以下命令**（一行一行复制粘贴）：

```cmd
# 进入解压后的文件夹（修改为你的实际路径）
cd C:\Users\你的用户名\Downloads\recipe-app-upload

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 连接远程仓库（修改为你的用户名）
git remote add origin https://github.com/你的用户名/recipe-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

4. **输入密码**
   - 会提示输入 GitHub 用户名和密码
   - 密码是 GitHub 的 **Personal Access Token**（不是登录密码）
   - 获取方法：GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

## 🔧 获取 GitHub Token 的方法

1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 左侧最下面 → **Developer settings**
4. 左侧 → **Personal access tokens** → **Tokens (classic)**
5. 点击 **Generate new token (classic)**
6. 填写：
   - **Note**: `Recipe App Token`
   - **Expiration**: No expiration
   - **Scopes**: 勾选 `repo`
7. 点击 **Generate token**
8. **复制生成的 token**（只显示一次！）

---

## ❓ 常见问题

### Q: 网页上传提示"Too many files"
A: GitHub 网页限制一次最多 100 个文件。解决方法：
- 使用 GitHub Desktop 或命令行（无限制）
- 或者分批上传：先上传 `.github`、`public`、`src` 三个文件夹，再上传其他文件

### Q: 命令行提示"Permission denied"
A: 使用了错误的密码，需要使用 Personal Access Token

### Q: 提示"repository not found"
A: 仓库名或用户名写错了，检查 `git remote add origin` 那行的地址

---

## 💡 推荐方案

| 你的情况 | 推荐方法 |
|---------|---------|
| 完全新手 | 方法一（网页拖拽） |
| 经常更新 | 方法二（GitHub Desktop） |
| 有编程基础 | 方法三（命令行） |

---

需要我远程协助吗？可以告诉我你的 GitHub 用户名，我帮你检查配置。
