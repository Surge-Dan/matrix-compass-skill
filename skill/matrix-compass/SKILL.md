---
name: matrix-compass
description: 在Windows本地安全安装、启动、导入、分析、备份和恢复Matrix Compass创作者经营系统；适用于用户要求安装Matrix Compass、打开本地网页、导入CSV/XLSX、手动录入、开启或关闭登录自动启动、备份恢复、故障诊断时。
compatibility: Windows PowerShell,Git,Node.js 22.13+,npm
---

# Matrix Compass本地Skill

Matrix Compass是一个本地优先的创作者经营系统：内容、日程、账号、收入和复盘数据留在用户选择的本机目录，不要求连接公众号、小红书、抖音或快手后台。

## 给普通用户的最短流程

当用户说“安装Matrix Compass”“启动本地网页”或“我要使用这个Skill”时，按下面流程执行，不要先让用户学习命令：

1.只询问一次是否允许登录自动启动：

   > 是否允许Windows登录后自动启动Matrix Compass？仅当前用户、不需要管理员权限、服务已运行时不会重复启动。允许/不允许

2.用户明确允许时，执行安装并启动流程，带上`-AutoStart`；用户不允许时，省略该参数。自动启动不是使用本地网页的前置条件。

3.安装流程会自动完成：检查运行环境、安装锁定依赖、初始化本地数据库、启动服务、检查`/api/health`，并打开`http://127.0.0.1:3000`。服务已健康运行时不会重复启动。

4.向用户只报告四件事：网页地址、数据目录、是否已开启登录自动启动、健康检查结果。不要把Node版本、迁移细节或PowerShell参数塞进普通用户的第一步。

推荐话术：

> Matrix Compass已在本机启动。打开 http://127.0.0.1:3000 即可使用；你的数据保存在【数据目录】。登录自动启动：【已开启/未开启】。

## 安装与启动脚本

Skill所在目录的`scripts`提供一个面向普通用户的入口：

```powershell
.\scripts\install.ps1 -TargetPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
```

`install.ps1`完成安装后会自动调用`setup.ps1`。自动启动是显式同意才开启的可选项：

```powershell
.\scripts\install.ps1 -TargetPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -AutoStart
```

高级用户或诊断场景可直接使用：

```powershell
.\scripts\start.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
```

默认只监听`127.0.0.1`。需要手机在同一可信Wi-Fi访问时，才显式增加`-Lan`；不自动修改防火墙，不做公网映射。

## 自动启动的安全边界

- 只有用户明确说“允许”后，才执行`autostart.ps1 -Action install`或传入`-AutoStart`
- 只写入当前Windows用户的启动目录，不需要管理员权限，不改系统级服务
- 启动前检查`/api/health`，服务已运行时不会重复拉起
- 用户拒绝时，仍然可以立即使用本地网页，只是不保存登录自动启动设置
- 用户可用`autostart.ps1 -Action status`查看状态，用`-Action uninstall`关闭

```powershell
.\scripts\autostart.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Action status
.\scripts\autostart.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -Action uninstall
```

## 数据怎么进入系统

用户有两条等价入口：

- 表单手动填写：账号、发布记录、日程、收入明细、结算状态、复盘亮点和优化方向
- 文件导入：CSV或XLSX；先上传并预览字段映射、错误行和重复记录，再提交导入批次

推荐字段：

- 发布记录：平台、账号、内容主题、发布时间、发布类型、内容链接、复盘亮点、复盘问题、优化方向
- 收入明细：平台、账号、收入类型、收入金额、结算状态、到账日期、备注
- 日程：日期、内容主题、平台、账号、计划状态、优先级、备注
- 账号：平台、账号名称、账号定位、发布规则、选题方向、变现路径、当前粉丝量

旧版`.xls`请先另存为`.xlsx`或`.csv`。导入失败必须保留错误明细，不要覆盖原有数据；已提交批次可在导入管理中回滚。

## 日常使用顺序

1.在账号管理中维护平台和账号定位
2.在日程管理中安排选题、发布时间和状态
3.在内容库记录发布结果并填写复盘
4.在收入管理中记录金额、类型和结算状态
5.在分析仪表盘查看平台分布、内容趋势、收入趋势和待办行动

公众号、小红书、抖音、快手暂不作为默认实时连接器；手动记录和CSV/XLSX导入是稳定主路径。未来接入连接器时，也必须沿用同一字段契约、导入批次、审计和备份机制。

## 备份、恢复和诊断

```powershell
.\scripts\doctor.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
.\scripts\backup.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData"
.\scripts\restore.ps1 -ProjectPath "C:\Tools\matrix-compass" -DataPath "C:\Users\Public\MatrixCompassData" -BackupPath "C:\...\backup"
```

恢复默认先做隔离dry-run。升级前先备份；迁移、manifest、行数和外键检查必须通过后再切换数据。

## 不要做的事

- 不索要或保存平台Cookie、密码、APIKey
- 不在没有明确同意时开启登录自动启动
- 不申请管理员权限、不安装系统服务、不自动改防火墙
- 不把本地数据上传到公网或第三方云端
- 不用“进程存在”冒充可用，必须以`/api/health`为准
- 不删除、重建或覆盖用户数据；涉及恢复和回滚先说明范围

## 高级诊断

如果安装或启动失败，再检查Node.js 22.13+、npm、Git、端口3000和数据目录权限，并查看数据目录下的`logs/matrix-compass.error.log`。高级用户可以单独运行`doctor.ps1`，普通用户不需要理解这些参数。

每次执行后报告：项目路径、数据路径、运行模式、健康检查、备份/恢复演练结果和仍未完成的风险；绝不输出密钥。
