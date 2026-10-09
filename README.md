# 蛋查查 · NCR Egg Check

基于 MyGo、Go 与 WebView 的精灵蛋范围查询桌面应用。筛选数据保存在独立的 [`data/pets.json`](data/pets.json) 中，并在构建时嵌入 Go 应用；正式运行时由 Go 提供蛋组列表和精灵查询。

## 开发环境

- Go 1.27 或更新版本
- Node.js 22.12 或更新版本，以及 npm
- Windows 需要 WebView2 Runtime；Windows 11 已自带

## 运行与打包

```powershell
npm install
npm --prefix ui-draft install
npm run dev
```

生成 Windows 桌面应用：

```powershell
npm run build
```

MyGo 将应用输出到 `build/windows-amd64/`，包含可执行文件和安装程序。前端位于 `ui-draft/`，Go 查询逻辑位于 `main.go`。普通浏览器的 Vite 预览会使用开发适配器，正式 MyGo 应用通过类型化绑定调用 Go。

## 版本与变更日志

版本号和 [`CHANGELOG.md`](CHANGELOG.md) 可根据 Git 提交自动更新。提交信息使用 Conventional Commits 格式，例如：

- `feat: 增加导出功能`：提升次版本号。
- `fix: 修正编号搜索`：提升修订版本号。
- `feat!: 调整数据文件格式`：提升主版本号。也可在提交正文中写 `BREAKING CHANGE:`。

首次启用时，先将当前 1.0.0 内容提交到 Git，并为这个基线创建标签 `v1.0.0`。之后每次准备发布时运行：

```powershell
npm run release:dry-run
npm run release
```

脚本会依据基线标签之后的提交类型计算版本号，生成日志条目，并同步更新根目录及 `ui-draft/` 的版本清单和锁文件，以及 `mygo.config.ts`。检查生成的改动并提交后，为该发布提交创建对应标签（例如 `v1.1.0`），供下一次发布作为起点。该流程在本地 Git 仓库运行，不依赖 GitHub。

## 依赖与素材

UI 使用 [Roco Kingdom UI](https://github.com/rookie-orange/rocokingdom-ui)。相关许可与配色来源记录在 [`ui-draft/THIRD-PARTY-NOTICES.md`](ui-draft/THIRD-PARTY-NOTICES.md)。

构建只打包 `data/pets.json`、前端页面及 `ui-draft/public/` 中使用的素材。`source-assets/` 保存原始素材供后续维护，不会被打进应用。

## 许可证

本项目原创应用代码采用 MIT 许可证，见 [`LICENSE`](LICENSE)。Wiki 衍生数据、游戏图片和第三方组件不随代码一并改为 MIT；各自来源、署名和许可范围见 [`DATA-LICENSES.md`](DATA-LICENSES.md) 与 [`ui-draft/THIRD-PARTY-NOTICES.md`](ui-draft/THIRD-PARTY-NOTICES.md)。
