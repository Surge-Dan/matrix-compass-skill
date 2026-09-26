# Matrix Compass Apple 风格 UI 实施计划

状态：待开始

关联规格：[2026-09-26-matrix-compass-apple-ui-design.md](../specs/2026-09-26-matrix-compass-apple-ui-design.md)

日期：2026-09-26

## 1. 实施目标

在不破坏现有本地数据、导入链路、备份能力和 API 契约的前提下，把现有 Matrix Compass 操作壳层升级为 Apple 风格的个人创作者经营看板。

第一轮必须完成：

1. 全局壳层和导航。
2. 首页总览和内容航向组件。
3. 作品列表与右侧详情面板。
4. 导入预览、确认、错误和回滚反馈。
5. 账号连接状态。
6. 备份与安全状态。

第一轮不实现平台私有接口抓取，不增加 Cookie 采集、验证码绕过或反检测逻辑。

## 2. 现状与保留边界

### 2.1 现有入口

- 页面入口：`app/page.tsx`
- 操作壳层：`components/app/operations-app.tsx`
- 操作视图：`components/app/operations-view.tsx`
- 旧看板：`components/dashboard/*`
- 现有样式：`app/globals.css`
- 数据接口：`app/api/dashboard/route.ts`、`app/api/contents/route.ts`、`app/api/accounts/route.ts`、`app/api/finance/route.ts`
- 导入接口：`app/api/imports/preview/route.ts`、`app/api/imports/commit/route.ts`、`app/api/imports/rollback/route.ts`

### 2.2 不变的业务边界

- 不清空或重建用户数据。
- 不修改现有数据库迁移历史。
- 不让同步数据覆盖个人复盘、标签、问题、优化方向和收入备注。
- 不改变已有导入批次、预览、确认和回滚 API 的语义。
- 不把凭据写入普通数据备份。
- 不把公网演示模式连接到本地用户数据。

## 3. 实施顺序

### 阶段 A：设计令牌和全局壳层

目标：先完成视觉基线，避免每个页面各自调色。

涉及文件：

- `app/globals.css`
- `components/navigation/desktop-sidebar.tsx`
- `components/navigation/mobile-nav.tsx`
- `components/app/operations-app.tsx`
- `components/app/operations-view.tsx`

任务：

- 建立浅色、深色和跟随系统三套令牌。
- 移除旧纸张色、珊瑚色主导和过重阴影作为默认视觉。
- 建立统一的 12px、18px、24px 圆角层级。
- 建立顶部工具栏、侧栏、移动底部导航的响应式结构。
- 所有导航文字改为中文业务语言。
- 统一键盘焦点、禁用态、加载态和减少动效处理。
- 不引入新的图标库，先检查现有依赖；若需要图标库，先单独确认依赖方案。

验收：

- 桌面和移动端导航不溢出。
- 系统浅色和深色切换后信息层级不改变。
- 现有页面入口仍可访问。

### 阶段 B：首页总览和内容航向

目标：首页能够在 5 秒内回答最近内容表现和下一步方向。

涉及文件：

- `components/dashboard/overview-page.tsx`
- `components/dashboard/dashboard-view.tsx`
- `components/dashboard/dashboard-app.tsx`
- `lib/dashboard-data.ts`
- `lib/dashboard-format.ts`
- `lib/dashboard-fixtures.ts`
- `app/api/dashboard/route.ts`

任务：

- 将时间范围、平台、账号、同步状态和备份状态统一放入顶部控制区。
- 将四项核心指标改为连续指标带，而不是四张相同卡片。
- 增加内容航向组件。
- 首页默认展示 1 条主洞察和最多 2 条次级洞察。
- 洞察必须带有真实数据依据和可追溯作品。
- 增加作品表现轨迹图表。
- 图表节点点击后能定位到具体作品。
- 增加值得继续列表、平台表现和最近动态。
- 保留现有真实数据模式和演示数据模式的隔离。

验收：

- 数据不足时显示样本不足，不生成虚假排名。
- 空数据时引导导入或新建，不显示空白画布。
- 加载、失败和重试状态可见。
- 图表能进入作品详情。

### 阶段 C：作品列表与右侧详情面板

目标：作品是所有内容数据的主入口，编辑不离开当前上下文。

涉及文件：

- `components/dashboard/module-pages.tsx`
- `components/modules/operations-modules.tsx`
- `lib/domain/content.ts`
- `lib/repositories/contents.ts`
- `app/api/contents/route.ts`
- `app/api/reviews/route.ts`

任务：

- 增加作品筛选栏。
- 作品列表默认只展示必要字段。
- 支持快速新建作品。
- 支持一个作品下的多平台发布记录。
- 增加右侧详情面板。
- 详情面板展示表现快照、收入记录和个人复盘。
- 将平台原始数据和个人编辑字段视觉分层。
- 允许从图表、作品列表和异常提示打开同一详情面板。
- 移动端将详情面板转换为底部抽屉或全屏编辑页。

验收：

- 打开和关闭详情面板后，原有筛选条件保留。
- 编辑复盘不会触发平台数据覆盖。
- 作品没有平台数据时仍能保存手动记录。

### 阶段 D：导入体验

目标：让 277 条飞书记录可以安全迁移，并且每一步都可检查和回滚。

涉及文件：

- `components/onboarding/empty-state.tsx`
- `lib/imports/file.ts`
- `lib/imports/parser.ts`
- `lib/imports/service.ts`
- `app/api/imports/preview/route.ts`
- `app/api/imports/commit/route.ts`
- `app/api/imports/rollback/route.ts`

任务：

- 空状态提供导入已有记录和新建第一条作品两个主入口。
- 支持 CSV/XLSX 文件选择。
- 识别工作表和字段。
- 展示自动映射结果。
- 对不确定字段标记待确认。
- 展示新增、重复、异常三类记录。
- 导入前自动触发备份。
- 确认后执行批量写入。
- 写入失败时执行整体回滚。
- 导入完成后展示批次摘要和撤销入口。

验收：

- 277 条记录可以预览，不直接写入。
- 异常行不会阻塞其他行预览，但确认导入时不得产生部分静默写入。
- 重复记录不会被覆盖。
- 回滚后数据库和导入前一致。

### 阶段 E：平台连接状态

目标：真实展示每个平台的连接能力和数据来源。

涉及文件：

- `components/modules/operations-modules.tsx`
- `components/dashboard/module-pages.tsx`
- `lib/domain/account.ts`
- `lib/repositories/accounts.ts`
- `app/api/accounts/route.ts`

任务：

- 公众号显示官方接口连接状态。
- 抖音显示授权和数据延迟状态。
- 小红书显示导出导入状态，不伪装成完整自动同步。
- 预留 B站、YouTube 连接器状态，不提前实现未确认的接口。
- 显示授权范围、最近同步时间、最近错误和下一步操作。
- 将“连接账号”和“立即同步”区分为两个动作。

验收：

- 每个平台都能说明数据来源和能力边界。
- 授权失效时只影响对应账号，不影响本地历史数据。
- 连接器失败不会阻塞作品手动新建和导入。

### 阶段 F：备份与安全状态

目标：让用户知道数据是否安全、是否可以恢复。

涉及文件：

- `lib/backup/manifest.ts`
- `lib/runtime/data-dir.ts`
- `scripts/backup-local.ts`
- `scripts/restore-local.ts`
- 备份与安全对应的页面组件和 API

任务：

- 展示最近一次备份、备份目录和第二备份目录。
- 支持立即备份。
- 导入、升级和恢复前自动备份。
- 支持恢复预演。
- 显示备份完整性和数据库健康状态。
- 将凭据与普通用户数据分开管理。
- 备份失败时触发系统通知并在动态列表中保留记录。

验收：

- 备份失败有明确原因和下一步操作。
- 恢复预演不会修改当前数据。
- 恢复前后均可生成审计记录。

## 4. 动效与无障碍验收

- 普通控件按下时立即有反馈。
- 面板和图表使用可中断、临界阻尼的过渡。
- 悬停时其他内容降低对比度，但不影响键盘和触屏操作。
- 支持 `prefers-reduced-motion`。
- 支持减少透明度回退。
- 支持高对比度模式。
- 所有可交互元素有可见焦点。
- 图表提供文字摘要或表格化替代信息。
- 不以颜色作为唯一状态表达。
- 移动端触控区域不小于 44px。

## 5. 测试顺序

1. 先运行现有单元和契约测试，记录基线。
2. 每完成一个阶段运行对应组件测试。
3. 首页完成后运行桌面和移动端 Playwright 测试。
4. 导入阶段运行预览、确认、重复、异常和回滚测试。
5. 连接器页面运行授权失效和同步失败测试。
6. 备份页面运行备份成功、失败和恢复预演测试。
7. 最后运行完整质量、类型、安全和构建检查。

## 6. 风险与回滚

- 视觉改造优先覆盖操作壳层，不删除旧看板组件，避免现有兼容路由失效。
- 数据模型和 API 先保持兼容，新增字段必须有迁移和回退策略。
- 任何数据库结构变化前先执行一次独立备份。
- 平台连接器不能阻塞本地数据操作。
- 发现数据目录、现有端口或运行模式异常时暂停部署，不自动清空或重建数据。
- 每个阶段完成后保留可运行版本，避免一次性大改导致无法定位问题。

## 7. 交付物

- UI 设计规格：`docs/superpowers/specs/2026-09-26-matrix-compass-apple-ui-design.md`
- 本实施计划：`docs/superpowers/plans/2026-09-26-matrix-compass-apple-ui-implementation.md`
- 后续代码修改应以这两个文件为依据，并补充对应测试。
