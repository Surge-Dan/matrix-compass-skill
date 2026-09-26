import type { BootstrapData } from "../../lib/application/get-bootstrap";
import {
  DesktopSidebar,
  OPERATIONS_NAVIGATION,
  type OperationsPage,
} from "../navigation/desktop-sidebar";
import { MobileNav } from "../navigation/mobile-nav";
import { DemoModeBanner } from "../onboarding/demo-mode-banner";
import { EmptyState } from "../onboarding/empty-state";
import { OperationsModule } from "../modules/operations-modules";

function formatMoney(minor: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

function OverviewToolbar({ isDemo }: { isDemo: boolean }) {
  return (
    <section className="overview-toolbar" aria-label="看板控制区">
      <div className="overview-filters">
        <button type="button" className="overview-range" aria-pressed="true" disabled title="导入指标快照后可筛选">最近 30 天</button>
        <button type="button" className="overview-filter" disabled title="导入指标快照后可筛选">全部平台</button>
        <button type="button" className="overview-filter" disabled title="导入指标快照后可筛选">全部账号</button>
      </div>
      <div className="overview-utilities">
        <span className="backup-status">备份状态 · {isDemo ? "演示环境" : "待检查"}</span>
        <button type="button" className="operations-sync-button" disabled title="连接平台后可同步">立即同步</button>
      </div>
    </section>
  );
}

function ContentCompass({ direction, evidence }: { direction: string; evidence: string }) {
  return (
    <section className="content-compass" aria-labelledby="content-compass-title">
      <div className="content-compass-dial" aria-hidden="true"><i /></div>
      <div>
        <p id="content-compass-title">内容航向</p>
        <strong>{direction}</strong>
        <span>{evidence}</span>
      </div>
      <button type="button" className="text-button" disabled title="导入指标快照后可查看依据">查看依据</button>
    </section>
  );
}

function PerformanceTrajectory({ isDemo }: { isDemo: boolean }) {
  return (
    <section className="performance-trajectory" aria-labelledby="performance-trajectory-title">
      <header>
        <div>
          <p>内容表现</p>
          <h2 id="performance-trajectory-title">作品表现轨迹</h2>
        </div>
        <span>{isDemo ? "触达" : "等待指标快照"}</span>
      </header>
      <div className="trajectory-plot" role="img" aria-label={isDemo ? "最近三十天触达趋势上升" : "尚未导入可追溯的作品表现快照"}>
        <i /><i /><i /><i />
        {isDemo ? <b /> : null}
      </div>
      <footer><span>30 天前</span><span>今天</span></footer>
    </section>
  );
}

function DemoOverview({ data }: { data: BootstrapData }) {
  const metrics = data.metrics;
  return (
    <section className="operations-overview" aria-labelledby="operations-overview-title">
      <OverviewToolbar isDemo />
      <div className="operations-hero">
        <p className="operations-eyebrow">最近 30 天</p>
        <h1 id="operations-overview-title">最近 30 天，内容在变好</h1>
        <p>从内容、排期和收入回到同一份可追溯的经营事实。</p>
        <ContentCompass direction="继续" evidence="高表现内容正在形成可复用的信号" />
      </div>
      <div className="operations-metrics" aria-label="演示经营指标">
        <article><span>发布内容</span><strong>{data.counts.contents}</strong><small>{data.counts.accounts} 个账号</small></article>
        <article><span>总收入</span><strong>{formatMoney(metrics?.revenueMinor ?? 0)}</strong><small>演示口径</small></article>
        <article><span>已结算</span><strong>{formatMoney(metrics?.settledMinor ?? 0)}</strong><small>已确认收入</small></article>
        <article><span>待结算</span><strong>{formatMoney(metrics?.pendingMinor ?? 0)}</strong><small>需要跟进</small></article>
      </div>
      <section className="overview-analysis-grid">
        <PerformanceTrajectory isDemo />
        <section className="continuation-list" aria-labelledby="continuation-list-title">
          <header><p>下一步</p><h2 id="continuation-list-title">值得继续</h2></header>
          <ol>
            <li><span>01</span><div><strong>AI 工具实测</strong><small>互动与收藏信号更强</small></div><em>+42%</em></li>
            <li><span>02</span><div><strong>产品拆解</strong><small>保持稳定触达</small></div><em>+18%</em></li>
            <li><span>03</span><div><strong>工作流分享</strong><small>建议继续观察</small></div><em>+9%</em></li>
          </ol>
        </section>
      </section>
    </section>
  );
}

function LocalOverview({ data }: { data: BootstrapData }) {
  return (
    <section className="operations-overview" aria-labelledby="operations-overview-title">
      <OverviewToolbar isDemo={false} />
      <div className="operations-hero">
        <p className="operations-eyebrow">本地经营库</p>
        <h1 id="operations-overview-title">先把真实记录整理清楚。</h1>
        <p>只展示当前本地库能够证明的经营事实。</p>
        <ContentCompass direction="待观察" evidence="导入表现快照后，系统才能给出内容方向" />
      </div>
      <div className="operations-metrics" aria-label="本地经营记录概况">
        <article><span>账号记录</span><strong>{data.counts.accounts}</strong><small>{data.counts.accounts} 个账号</small></article>
        <article><span>内容记录</span><strong>{data.counts.contents}</strong><small>{data.counts.contents} 条内容</small></article>
        <article><span>收入指标</span><strong>无法计算</strong><small>尚未接入收入流水</small></article>
        <article><span>经营趋势</span><strong>待观察</strong><small>需要可追溯指标快照</small></article>
      </div>
      <section className="overview-analysis-grid">
        <PerformanceTrajectory isDemo={false} />
        <section className="operations-placeholder-panel">
          <div><strong>没有证据的数字不会出现在这里</strong><span>完成收入与指标导入后，再按来源、时间范围和样本量计算。</span></div>
        </section>
      </section>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PendingModule({ page }: { page: OperationsPage }) {
  const label = OPERATIONS_NAVIGATION.find((item) => item.id === page)?.label ?? "经营模块";
  return (
    <section className="operations-module-pending">
      <p className="operations-eyebrow">REAL DATA WORKFLOW</p>
      <h1>{label}</h1>
      <p>导航结构已经切换；该工作流将在对应里程碑接入真实数据。</p>
    </section>
  );
}

export function OperationsView({
  data,
  activePage = "overview",
  notice,
  onNavigate = () => undefined,
  onAction = () => undefined,
}: {
  data: BootstrapData;
  activePage?: OperationsPage;
  notice?: string | null;
  onNavigate?(page: OperationsPage): void;
  onAction?(action: BootstrapData["actions"][number]): void;
}) {
  return (
    <div className="operations-app">
      <a className="skip-link" href="#operations-content">跳到主要内容</a>
      <DesktopSidebar activePage={activePage} onNavigate={onNavigate} />
      <section className="operations-workspace">
        <header className="operations-topbar">
          <div className="operations-mobile-brand"><span>矩</span><strong>矩阵罗盘</strong></div>
          <div><span>矩阵罗盘</span><i>/</i><strong>{OPERATIONS_NAVIGATION.find((item) => item.id === activePage)?.label}</strong></div>
          <span className={data.mode === "demo" ? "operations-source is-demo" : "operations-source"}>
            {data.mode === "demo" ? "演示数据" : "本地真实数据"}
          </span>
        </header>
        {data.mode === "demo" ? <DemoModeBanner /> : null}
        {notice ? <div className="operations-notice" role="status">{notice}</div> : null}
        <main id="operations-content" className="operations-content">
          {activePage !== "overview" ? (
            <OperationsModule page={activePage} />
          ) : data.needsOnboarding ? (
            <EmptyState actions={data.actions} onAction={onAction} />
          ) : data.mode === "demo" ? (
            <DemoOverview data={data} />
          ) : (
            <LocalOverview data={data} />
          )}
        </main>
      </section>
      <MobileNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}
