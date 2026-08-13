# 🧭 Matrix Compass

![Node.js](https://img.shields.io/badge/Node.js-22.13%2B-43853D?style=flat-square&logo=node.js&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white)
![Mode](https://img.shields.io/badge/Mode-Local--first-111111?style=flat-square)
![Import](https://img.shields.io/badge/Import-CSV%20%7C%20XLSX-2E7D32?style=flat-square)
![Responsive](https://img.shields.io/badge/UI-Desktop%20%2B%20Mobile-7B61FF?style=flat-square)
![Security](https://img.shields.io/badge/Security-No%20cloud%20credentials-C0392B?style=flat-square)

**把创作者的内容、日程和收入，变成一套真正能每天使用的本地经营系统**

Matrix Compass不是一个只展示漂亮数字的看板，也不是把飞书表格换成另一张表格。它更像一个安静、可靠、可回溯的经营工作台：你可以手动记录，也可以导入CSV/XLSX；可以安排下一篇内容，也可以复盘上一笔收入；数据始终留在你明确选择的本机目录里。

> 适配公众号、小红书、抖音、快手等多平台创作者。默认不连接平台后台，不要求上传Cookie或API密钥。

## ⚡30秒开始

如果仓库已经安装完成，直接运行：

~~~powershell
.\skill\matrix-compass\scripts\start.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
~~~

然后打开<http://127.0.0.1:3000>。

如果还没有安装：

~~~powershell
git clone https://github.com/Surge-Dan/matrix-compass.git C:\Tools\matrix-compass
cd C:\Tools\matrix-compass
.\skill\matrix-compass\scripts\install.ps1 -TargetPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
~~~

安装后可以直接对Agent说：

~~~text
帮我启动MatrixCompass，并告诉我浏览器地址。
~~~

也可以这样开始：

~~~text
把这份飞书多维表格导出的XLSX导入MatrixCompass，先预览错误，不要直接写入。
~~~

~~~text
帮我新增一个小红书账号，再安排下周三发布一条内容。
~~~

~~~text
把本月收入按平台和结算状态分析一下，告诉我还有哪些钱没收回来。
~~~

## 为什么做这件事

很多创作者并不是没有数据，而是数据散落在飞书、Excel、备忘录、平台后台和聊天记录里。真正困难的地方通常不是“看不到一个数字”，而是：

- 记了很多内容，却不知道哪些主题值得继续做。
- 有发布计划，却没有一个能和真实执行连接起来的日程。
- 收入分散在合作、广告、佣金和平台结算里，到账与未到账经常混在一起。
- 想从飞书迁移出来，却担心字段丢失、导入错误或误覆盖历史数据。
- 想接平台API，却不愿意为了一个看板交出高风险的账号权限。

Matrix Compass先解决可落地、可验证、风险可控的部分：本地记录、文件导入、批次回滚、日程管理、收入核算和经营分析。它不假装自己已经拥有所有平台权限，也不把“自动化”建立在不可审计的黑箱上。

## 它是怎么工作的

Matrix Compass围绕一条“记录→安排→发布→结算→复盘”的闭环工作：

1. **建立账号资产**：记录平台、账号名称、账号定位、发布规则和粉丝快照。
2. **规划内容与日程**：把选题、发布时间和发布状态放入内容库与日历。
3. **导入或手动录入**：支持表单填写，也支持CSV/XLSX文件；飞书多维表格可先导出再导入。
4. **预览和校验**：系统先检查字段、日期、平台、账号和金额，错误行会在写入前展示。
5. **批次化写入**：每次导入都记录批次，提交后仍可回滚本批次，不静默覆盖已有数据。
6. **分析经营结果**：按平台、内容类型、收入类型和结算状态查看趋势与结构。
7. **复盘下一步**：把亮点、问题、假设和下一行动写回经营流程，而不是停在一次性报表里。

## 效果与能力

- 📊**账号资产**：平台、账号定位、内容方向、发布节奏、粉丝快照。
- 🗓️**内容日历**：计划时间、发布状态、平台和账号关联，桌面端与手机端都能使用。
- 💰**收入管理**：收入/支出、合作类型、金额、结算状态、预计结算日和复盘字段。
- 📥**外部导入**：CSV、XLSX、飞书多维表格导出文件；旧版XLS请先另存为XLSX或CSV。
- ↩️**安全回滚**：导入批次可追踪、可回滚，避免一次误操作污染经营库。
- 🔬**复盘实验**：记录证据、假设、下一步行动和可量化指标。
- 📈**经营分析**：平台表现、内容趋势、收入结构、结算状态和高收入内容。
- 🔒**本地优先**：数据默认写入用户指定目录，不上传云端，不保存平台密钥。

## 适合什么，不适合什么

|场景|适合程度|说明|
|------|----------|------|
|个人创作者经营多个平台|✅适合|账号、内容、日程和收入可以放在同一套数据里|
|从飞书或Excel迁移记录|✅适合|先导出CSV/XLSX，再预览、确认、回滚|
|想做本地经营分析|✅适合|数据默认保存在本机，适合长期积累|
|需要团队共享同一份云端数据|⚠️暂不作为主路径|当前优先保证本地安全和单机可追溯|
|自动读取平台后台数据|⚠️暂不默认支持|平台权限、审核和账号安全风险较高|
|公网部署给陌生人访问|❌不建议|本项目默认面向本机或可信局域网|

## 真实数据导入

网页进入“数据导入与同步”，选择目标后上传CSV或XLSX。系统采用：

~~~text
选择目标→上传文件→预览字段→修正错误→确认写入→必要时回滚
~~~

内容导入至少需要：

~~~text
platform,account,title,date
~~~

收入导入至少需要：

~~~text
platform,account,direction,category,amount,occurred_at
~~~

可选字段：`settlement_status`、`settled_amount`、`expected_settlement_at`、`currency`、`note`。

金额按元填写，系统以整数分保存。中文字段和英文标准字段都支持；导入失败时不会创建半截数据。

## 安装与运行

### 环境要求

- Node.js22.13或更高版本
- Git
- WindowsPowerShell
- 桌面端浏览器；手机访问需要电脑和手机处于同一可信Wi-Fi

### 本机访问

~~~powershell
.\skill\matrix-compass\scripts\start.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
~~~

浏览器打开<http://127.0.0.1:3000>。这个地址只在服务进程存活期间有效；关闭PowerShell窗口或结束Node进程后，请重新启动服务。

### 手机局域网访问

~~~powershell
.\skill\matrix-compass\scripts\start.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Lan
~~~

终端会输出局域网地址。局域网模式不会自动修改防火墙，不做公网映射，只建议在可信Wi-Fi中使用。

### 登录自动启动（必须先征得用户同意）

安全性优先于便利性。安装脚本默认不会改变Windows登录行为。只有用户明确同意后，才执行：

~~~powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Action install
~~~

自动启动使用当前用户的Windows“启动”目录，不需要管理员权限；启动前检查`/api/health`，服务已运行时不会重复启动。

取消自动启动：

~~~powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Action uninstall
~~~

查看状态：

~~~powershell
.\skill\matrix-compass\scripts\autostart.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Action status
~~~

## 安全与数据边界

- 数据目录必须与项目目录分开，避免误提交和升级覆盖。
- 不上传真实账号Cookie、API密钥或平台登录信息。
- 不默认调用公众号、小红书、抖音、快手后台接口。
- 不自动清空、重建或覆盖用户数据。
- 升级前先备份，恢复默认只做隔离演练。
- 如果要开启局域网访问，先确认Wi-Fi可信，再检查防火墙和网络隔离策略。

## 备份、恢复与诊断

~~~powershell
npm run backup
npm run restore:dry-run -- --backup "C:\Users\Public\MatrixCompassData\backups\<timestamp>"
npm run db:check
~~~

一键诊断：

~~~powershell
.\skill\matrix-compass\scripts\doctor.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
~~~

诊断会检查Node.js、npm、项目文件、依赖、数据目录、数据库迁移、3000端口和`/api/health`，不会修改或清空经营数据。

## 质量保障

项目已配置单元测试、Gherkin测试、Playwright桌面/移动端测试、覆盖率、变异测试、依赖审计、敏感信息扫描、构建产物检查和数据库完整性校验。

~~~powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:coverage
npm run test:gherkin
npm run test:e2e
npm run test:mutation
npm run test:security
~~~

## 仓库结构

~~~text
matrix-compass/
├── app/                         ←页面与API路由
├── components/                 ←数据总览、账号、内容、收入和导入模块
├── lib/                        ←领域模型、仓储、导入解析和本地运行时
├── db/migrations/              ←本地数据库迁移
├── skill/matrix-compass/       ←可安装Skill与Windows运维脚本
│   ├── SKILL.md
│   └── scripts/
├── tests/                      ←单元、契约、Gherkin、E2E与Skill测试
└── README.md                   ←你正在看的说明
~~~

## 平台连接边界

公众号、小红书、抖音、快手的后台接口权限、审核、政策和账号安全风险不作为默认依赖。本项目先把手动记录、文件导入、经营分析和收入管理做成稳定闭环；未来增加连接器时，必须复用本地数据契约、审计、批次和备份机制。

## 常见问题

**为什么打开127.0.0.1:3000会显示无法连接？**

因为这是本地服务地址，不是静态文件地址。请先执行`start.ps1`，并保持服务进程运行；如果已经开启登录自动启动，登录后等待几秒再打开浏览器。

**能不能直接导入飞书多维表格？**

当前推荐从飞书导出CSV或XLSX后导入。这样字段映射、错误提示、批次写入和回滚都在本地完成，数据边界更清楚。

**会不会自动替我登录平台？**

不会。平台后台权限、Cookie和API密钥不属于默认依赖。你可以手动填写或导入平台导出的经营数据，后续连接器也必须经过明确授权和安全评估。

**登录自动启动安全吗？**

它只在当前Windows用户的启动目录创建一个本地启动项，不需要管理员权限，也不会修改防火墙。服务启动前会检查健康接口，已经运行时不会重复启动；是否开启必须先征得用户明确同意。

**数据放在哪里？**

数据放在你通过`-DataPath`指定的目录，例如`C:\Users\Public\MatrixCompassData`。升级或迁移前请先运行备份和数据库检查。

## Roadmap

- 继续优化桌面端与移动端的操作效率。
- 增加更细的内容表现分析和收入预测，但不牺牲数据可解释性。
- 完善导入模板、字段映射和导入前差异对比。
- 在安全评估、权限边界和失败回滚机制成熟后，再考虑受控平台连接器。

## 贡献与反馈

欢迎提交Issue或PullRequest。提交问题时，请提供复现步骤、诊断输出和脱敏后的字段示例；不要上传真实账号Cookie、API密钥或未经脱敏的经营数据。

如果这个项目帮你把分散的经营记录收拢起来，欢迎点一个⭐，这会帮助更多创作者发现它。
