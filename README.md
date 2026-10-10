# 蛋查查 · Rocom Egg Check

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

云端构建通过 GitHub Actions 的 `Cloud build` 工作流手动触发（Actions → Cloud build → Run workflow），分别生成 macOS arm64/x64 与 Windows x64/arm64 产物，并保存为 30 天有效的 workflow artifacts。工作流不会因提交、推送或打标签自动运行，也不会自动发布 GitHub Release；macOS 产物使用 ad hoc 签名，未经过开发者证书签名或公证。

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

### 更新图鉴数据

`data/pets.json` 由 [rocom-wiki-data](https://github.com/JayeGT002/rocom-wiki-data) 的 `Catalog.lua` 生成，不再手工维护宠物数据。先克隆或更新上游仓库，然后运行：

```sh
npm run data:import -- --source /path/to/rocom-wiki-data
```

脚本复用上游的 Lua 数据解析器和蛋组名称表，导入有完整蛋重区间的记录，并生成应用需要的蛋重间隔、属性和进化链。当前上游中没有完整 `egg_size` 的记录会跳过；源仓库提交号和 `Catalog.lua` SHA-256 会写入 JSON 的 `metadata.source`。可加 `--dry-run` 只查看导入数量、不改文件。

“难度档位”是应用展示字段，不在 WIKI 数据中。转换脚本根据蛋重总区间派生该值，并用当前 578 条记录各相邻档位区间的中点保持已有档位结果稳定；原始蛋重边界仍直接取自上游。

构建只打包 `data/pets.json`、前端页面及 `ui-draft/public/` 中使用的素材。`source-assets/` 保存原始素材供后续维护，不会被打进应用。

## For agent

开始项目开发前，agent 必须阅读 [`devdoc/`](devdoc/) 下的项目文档，并按 [`devdoc/agent-workflow.md`](devdoc/agent-workflow.md) 执行。代码、数据、界面、许可或开发与发布流程发生变化时，agent 负责同步维护相关文档，确保描述与仓库实现一致。文档专供开发参考，不会打包进应用。

### Agent 开发资料

- [项目简述](devdoc/project-overview.md)
- [设计语言](devdoc/design-language.md)
- [文档阅读与维护流程](devdoc/agent-workflow.md)

## 许可证

本项目原创应用代码采用 MIT 许可证，见 [`LICENSE`](LICENSE)。Wiki 衍生数据、游戏图片和第三方组件不随代码一并改为 MIT；各自来源、署名和许可范围见 [`DATA-LICENSES.md`](DATA-LICENSES.md) 与 [`ui-draft/THIRD-PARTY-NOTICES.md`](ui-draft/THIRD-PARTY-NOTICES.md)。
