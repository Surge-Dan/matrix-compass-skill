# Matrix Compass

🧭Matrix Compass是一个本地优先的创作者经营实验室，帮助你把账号、内容、发布日程、收入、复盘和实验放进同一套可追溯的数据系统。

它适合需要长期经营公众号、小红书、抖音、快手等平台，但又不希望把账号Cookie、API密钥或经营数据交给第三方服务的个人创作者和小团队。

##✨核心能力

- 📊账号资产：平台、账号定位、内容方向、发布节奏和粉丝快照。
- 🗓️内容与日程：内容主题、账号、计划时间、发布状态，支持日历视图。
- 💰收入管理：收入与支出、合作类型、金额、结算状态、预计结算日和复盘字段。
- 📥数据导入：支持CSV和XLSX，兼容飞书多维表格导出文件；先预览、再写入，错误行可定位。
- ↩️批次回滚：每次导入都有批次记录，误导入时可以回滚，不直接破坏已有数据。
- 🔬复盘与实验：记录亮点、问题、假设、下一步行动和可量化实验指标。
- 📈经营分析：按平台、内容类型、收入类型和结算状态查看经营结果。
- 🔒本地安全：自动迁移前备份、备份完整性校验、恢复默认只做隔离演练。

##🔐安全原则

安全性优先于便利性。默认情况下：

- 不连接公众号、小红书、抖音或快手后台，不要求上传平台密钥。
- 不把数据目录放进代码仓库，不把真实数据提交到Git。
- 不修改防火墙，不做公网映射；局域网访问只适用于可信Wi-Fi。
- 不会默认修改Windows登录行为。登录自动启动必须由用户明确同意后单独开启，且不需要管理员权限。
- 自动启动只会启动本地服务；服务已运行时会先检查`/api/health`，避免重复拉起。

##🧰安装

要求：Node.js22.13或更高版本、Git、WindowsPowerShell。

```powershell
git clone https://github.com/Surge-Dan/matrix-compass.git C:\Tools\matrix-compass
cd C:\Tools\matrix-compass
.\skill\matrix-compass\scripts\install.ps1 -TargetPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData
```

安装脚本会自动选择兼容的Node.js运行时，安装锁定依赖并执行数据库迁移。数据目录必须与项目目录分开。

###登录自动启动（可选）

安装不会默认设置登录自动启动。只有用户明确同意后，才执行：

```powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData -Action install
```

它会在当前用户的Windows“启动”目录创建启动项，不需要管理员权限。取消自动启动：

```powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData -Action uninstall
```

查看状态：

```powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData -Action status
```

##🚀启动与访问

###电脑本机

```powershell
.\skill\matrix-compass\scripts\start.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData
```

浏览器打开<http://127.0.0.1:3000>。请保持启动进程运行；关闭PowerShell窗口或结束Node进程后，浏览器会显示“无法连接”。

###手机与电脑同一Wi-Fi

```powershell
.\skill\matrix-compass\scripts\start.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData -Lan
```

使用终端输出的局域网地址访问。局域网模式不会自动修改防火墙，无法访问时先检查Windows网络配置和防火墙策略。

启动脚本会自动检查`node_modules`；依赖缺失时使用已选中的兼容Node.js版本执行`npm ci`。

##📥真实数据导入

进入网页的“数据导入与同步”模块，选择导入目标后上传CSV或XLSX文件。旧版XLS请先另存为XLSX或CSV。

内容导入至少需要以下字段：

```text
platform,account,title,date
```

收入导入至少需要以下字段：

```text
platform,account,direction,category,amount,occurred_at
```

可选字段包括：`settlement_status`、`settled_amount`、`expected_settlement_at`、`currency`、`note`。

金额按元填写，系统会以整数分保存。导入流程是“选择目标→预览→修正错误→确认写入→必要时回滚”，不会静默覆盖已有数据。

##💾备份与恢复

```powershell
npm run backup
npm run restore:dry-run -- --backup "C:\Users\Public\MatrixCompassData\backups\<timestamp>"
npm run db:check
```

备份是本地SQL快照和manifest。恢复命令默认只做隔离演练，不覆盖当前数据；升级前请先完成备份和数据库检查。

##🩺诊断

```powershell
.\skill\matrix-compass\scripts\doctor.ps1 -ProjectPath C:\Tools\matrix-compass -DataPath C:\Users\Public\MatrixCompassData
```

诊断会检查Node.js、npm、项目文件、依赖、数据目录、数据库迁移、3000端口和`/api/health`，不会清空或重建用户数据。

##✅质量保障

项目包含单元测试、Gherkin测试、Playwright桌面/移动端测试、覆盖率、变异测试、依赖审计、敏感信息扫描、构建产物检查和数据库完整性校验。

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:coverage
npm run test:gherkin
npm run test:e2e
npm run test:mutation
npm run test:security
```

##🧩平台连接边界

真实平台后台接口不是默认路径。平台权限、审核、账号安全和政策变化会带来较高风险。本版本优先把本地记录、文件导入、经营分析和收入管理做成稳定闭环；未来增加连接器时，必须复用同一套本地数据契约、审计、批次和备份机制。

##📄许可证与贡献

这是一个面向本地创作者经营的实验性工具。提交问题或改进建议时，请不要上传真实账号Cookie、API密钥或未经脱敏的经营数据。
