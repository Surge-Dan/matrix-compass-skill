"use client";

import { useEffect, useMemo, useState } from "react";
import { OPERATIONS_NAVIGATION, type OperationsPage } from "../navigation/desktop-sidebar";

type Account = { id: string; platform: string; name: string; status: string };
type Content = { id: string; accountId: string; title: string; stage: string; plannedAt: string | null };
type Finance = { id: string; direction: string; category: string; amountMinor: number; settlementStatus: string; occurredAt: string };
type ApiBody<T> = { data: T; error?: { message?: string } };
const platforms = [["wechat", "微信公众号"], ["xiaohongshu", "小红书"], ["douyin", "抖音"], ["kuaishou", "快手"], ["bilibili", "哔哩哔哩"]] as const;
const connectionGuides = [
  { name: "微信公众号", state: "官方授权", detail: "完成开发者授权后，按授权范围同步。" },
  { name: "小红书", state: "导出导入", detail: "从创作中心导出后，增量导入本地库。" },
  { name: "抖音", state: "官方经营授权", detail: "仅在获得对应经营数据授权后同步。" },
] as const;
const money = (minor: number) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(minor / 100);
const navigationLabel = (page: OperationsPage) => OPERATIONS_NAVIGATION.find((item) => item.id === page)?.label ?? page;

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store", headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json() as ApiBody<T>;
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed");
  return body.data;
}

function Header({ title, description }: { title: string; description: string }) {
  const labels: Record<string, OperationsPage> = { Accounts: "accounts", "Content calendar": "calendar", "Content library": "contents", Income: "finance", "Import and sync": "sources", "Reviews and experiments": "reviews", Settings: "settings" };
  return <div className="module-header"><div><p className="operations-eyebrow">本地经营工作流</p><h1>{labels[title] ? navigationLabel(labels[title]) : title}</h1><p>{description}</p></div></div>;
}

function AccountsModule() {
  const [items, setItems] = useState<Account[]>([]); const [platform, setPlatform] = useState("wechat"); const [name, setName] = useState(""); const [error, setError] = useState<string | null>(null);
  const load = () => api<Account[]>("/api/accounts").then(setItems).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  return <section className="module-panel"><Header title="Accounts" description="管理平台账号和经营状态，数据只保存在当前设备。" /><div className="module-form"><select aria-label="平台" value={platform} onChange={(e) => setPlatform(e.target.value)}>{platforms.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input aria-label="账号名称" placeholder="例如：Daniel 的公众号" value={name} onChange={(e) => setName(e.target.value)} /><button type="button" className="primary-action" onClick={() => { void api<Account>("/api/accounts", { method: "POST", body: JSON.stringify({ platform, name }) }).then(() => { setName(""); return load(); }).catch((e) => setError(e.message)); }}>添加账号</button></div>{error ? <p className="module-error" role="alert">{error}</p> : null}<div className="module-table">{items.map((item) => <div className="module-row" key={item.id}><strong>{item.name}</strong><span>{platforms.find(([value]) => value === item.platform)?.[1] ?? item.platform}</span><span className="status-chip">{item.status}</span></div>)}{items.length === 0 ? <p className="module-empty">还没有账号，先添加一个账号。</p> : null}</div></section>;
}

function ContentsModule({ calendar = false }: { calendar?: boolean }) {
  const [accounts, setAccounts] = useState<Account[]>([]); const [items, setItems] = useState<Content[]>([]); const [form, setForm] = useState({ accountId: "", title: "", plannedAt: "" }); const [error, setError] = useState<string | null>(null);
  const load = async () => { try { const [a, c] = await Promise.all([api<Account[]>("/api/accounts"), api<Content[]>("/api/contents")]); setAccounts(a); setItems(c); if (!form.accountId && a[0]) setForm((old) => ({ ...old, accountId: a[0].id })); } catch (e) { setError(e instanceof Error ? e.message : "Load failed"); } };
  // The async loader is a synchronization boundary for local data.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);
  const groups = useMemo(() => items.reduce<Record<string, Content[]>>((result, item) => { const key = item.plannedAt?.slice(0, 10) ?? "Unscheduled"; (result[key] ??= []).push(item); return result; }, {}), [items]);
  return <section className="module-panel"><Header title={calendar ? "Content calendar" : "Content library"} description={calendar ? "按日期查看计划发布节奏。" : "管理选题、账号、发布时间和发布状态。"} /><div className="module-form"><select aria-label="内容账号" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}><option value="">选择账号</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input aria-label="内容标题" placeholder="例如：本周 AI 工具复盘" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input aria-label="计划发布时间" type="datetime-local" value={form.plannedAt} onChange={(e) => setForm({ ...form, plannedAt: e.target.value })} /><button type="button" className="primary-action" onClick={() => { const plannedAt = form.plannedAt ? new Date(form.plannedAt).toISOString() : null; void api<Content>("/api/contents", { method: "POST", body: JSON.stringify({ accountId: form.accountId, title: form.title, plannedAt, stage: "scheduled" }) }).then(() => { setForm({ ...form, title: "", plannedAt: "" }); return load(); }).catch((e) => setError(e.message)); }}>新增内容</button></div>{error ? <p className="module-error" role="alert">{error}</p> : null}{calendar ? <div className="calendar-grid">{Object.entries(groups).map(([date, entries]) => <div className="calendar-day" key={date}><strong>{date}</strong>{entries.map((item) => <article key={item.id}><b>{item.title}</b><span>{item.stage}</span></article>)}</div>)}</div> : <div className="module-table">{items.map((item) => <div className="module-row" key={item.id}><strong>{item.title}</strong><span>{item.stage}</span><span>{item.plannedAt?.slice(0, 16).replace("T", " ") ?? "未安排"}</span></div>)}{items.length === 0 ? <p className="module-empty">还没有内容，先创建一个选题。</p> : null}</div>}</section>;
}

function FinanceModule() {
  const [accounts, setAccounts] = useState<Account[]>([]); const [items, setItems] = useState<Finance[]>([]); const [summary, setSummary] = useState({ totalIncomeMinor: 0, totalExpenseMinor: 0, settledIncomeMinor: 0, pendingIncomeMinor: 0 }); const [form, setForm] = useState({ accountId: "", direction: "income", category: "brand-deal", amount: "", occurredAt: "" }); const [error, setError] = useState<string | null>(null);
  const load = async () => { try { const [finance, accountRows] = await Promise.all([api<{ entries: Finance[]; summary: typeof summary }>("/api/finance"), api<Account[]>("/api/accounts")]); setItems(finance.entries); setSummary(finance.summary); setAccounts(accountRows); if (!form.accountId && accountRows[0]) setForm((old) => ({ ...old, accountId: accountRows[0].id })); } catch (e) { setError(e instanceof Error ? e.message : "Load failed"); } };
  // The async loader is a synchronization boundary for local data.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);
  return <section className="module-panel"><Header title="Income" description="记录收入、支出和结算状态，金额按元填写并以分保存。" /><div className="finance-summary"><article><span>收入</span><strong>{money(summary.totalIncomeMinor)}</strong></article><article><span>支出</span><strong>{money(summary.totalExpenseMinor)}</strong></article><article><span>已结算</span><strong>{money(summary.settledIncomeMinor)}</strong></article><article><span>待结算</span><strong>{money(summary.pendingIncomeMinor)}</strong></article></div><div className="module-form"><select aria-label="收入账号" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}><option value="">选择账号</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="收支方向" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}><option value="income">收入</option><option value="expense">支出</option></select><select aria-label="收入类型" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="brand-deal">品牌合作</option><option value="platform-share">平台分成</option><option value="affiliate">联盟/带货</option><option value="course">课程</option><option value="equipment">设备成本</option><option value="other">其他</option></select><input aria-label="金额" inputMode="decimal" placeholder="金额（元）" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /><input aria-label="发生日期" type="date" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} /><button type="button" className="primary-action" onClick={() => { const amountMinor = Math.round(Number(form.amount) * 100); const occurredAt = `${form.occurredAt}T00:00:00+08:00`; void api<Finance>("/api/finance", { method: "POST", body: JSON.stringify({ ...form, amountMinor, occurredAt, settlementStatus: "pending", settledAmountMinor: 0 }) }).then(() => { setForm({ ...form, amount: "", occurredAt: "" }); return load(); }).catch((e) => setError(e.message)); }}>添加流水</button></div>{error ? <p className="module-error" role="alert">{error}</p> : null}<div className="module-table">{items.map((item) => <div className="module-row" key={item.id}><strong>{item.direction === "income" ? "+" : "-"}{money(item.amountMinor)}</strong><span>{item.category}</span><span>{item.settlementStatus}</span><span>{item.occurredAt.slice(0, 10)}</span></div>)}{items.length === 0 ? <p className="module-empty">还没有收入流水，先添加一笔。</p> : null}</div></section>;
}

function ImportModule() {
  const [target, setTarget] = useState<"accounts" | "contents" | "finance">("contents");
  const [text, setText] = useState("platform,account,title,date\nwechat,示例账号,示例作品,2026-08-08");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ totalRows: number; valid: unknown[]; errors: { row: number; message: string }[] } | null>(null);
  const [batch, setBatch] = useState<{ batchId: string; successRows: number; failedRows: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const upload = async (url: string) => {
    if (!file) return null;
    const form = new FormData();
    form.set("file", file);
    form.set("target", target);
    const response = await fetch(url, { method: "POST", body: form, cache: "no-store" });
    const body = await response.json() as ApiBody<{ batchId: string; successRows: number; failedRows: number }> & { error?: { message?: string } };
    if (!response.ok) throw new Error(body.error?.message ?? "文件处理失败");
    return body.data;
  };
  const previewManual = () => api<typeof preview>("/api/imports/preview", { method: "POST", body: JSON.stringify({ text, target }) }).then(setPreview);
  const commitManual = () => api<{ batchId: string; successRows: number; failedRows: number }>("/api/imports/commit", { method: "POST", body: JSON.stringify({ text, target, fileName: "manual.csv" }) });
  const commit = async () => {
    const result = file ? await upload("/api/imports/commit") : await commitManual();
    if (result) {
      setBatch(result);
      setNotice(`已写入 ${result.successRows} 行，可随时回滚本批次。`);
    }
  };
  const rollback = async () => {
    if (!batch) return;
    await api(`/api/imports/rollback`, { method: "POST", body: JSON.stringify({ batchId: batch.batchId }) });
    setBatch(null);
    setNotice("本批次已回滚，相关导入记录已从经营库隐藏。 ");
  };
  return <section className="module-panel"><Header title="Import and sync" description="先预览校验，再确认写入；导入始终可按批次回滚。" /><div className="import-workflow"><div className="import-workflow-heading"><span>01</span><div><strong>先选数据来源</strong><p>支持飞书多维表格导出的 CSV / XLSX，也支持直接粘贴表格内容。</p></div></div><div className="module-form"><label className="field-label" htmlFor="import-target">导入目标</label><select id="import-target" aria-label="导入目标" value={target} onChange={(e) => { setTarget(e.target.value as typeof target); setPreview(null); }}><option value="accounts">账号资产</option><option value="contents">内容库</option><option value="finance">收入管理</option></select><label className="file-picker" htmlFor="import-file">上传 CSV 或 XLSX</label><input id="import-file" aria-label="上传文件" type="file" accept=".csv,.xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }} /><button type="button" className="secondary-action" onClick={() => { void (file ? upload("/api/imports/preview").then((data) => setPreview(data as typeof preview)) : previewManual()).catch((e) => setNotice(e.message)); }}>预览数据</button>{preview ? <button type="button" className="primary-action" onClick={() => { void commit().catch((e) => setNotice(e.message)); }}>确认写入</button> : null}{batch ? <button type="button" className="danger-action" onClick={() => { void rollback().catch((e) => setNotice(e.message)); }}>回滚本批次</button> : null}</div><div className="field-mapping"><strong>字段对应</strong><p>内容：<code>platform, account, title, date</code>；收入：<code>platform, account, direction, category, amount, occurred_at</code>。</p></div><textarea aria-label="CSV 内容" className="import-textarea" value={text} onChange={(e) => setText(e.target.value)} />{preview ? <div className="import-preview"><span>总行数 {preview.totalRows}</span><span className="success-text">可写入 {preview.valid.length}</span><span className="error-text">错误 {preview.errors.length}</span>{preview.errors.map((error) => <p key={`${error.row}-${error.message}`}>第 {error.row} 行：{error.message}</p>)}</div> : null}{notice ? <p className="operations-notice" role="status">{notice}</p> : null}</div><section className="connection-boundary" aria-label="平台连接方式"><header><div><p>连接边界</p><h2>平台数据如何进入</h2></div><span>只走官方路径</span></header><div className="connection-guide-grid">{connectionGuides.map((guide) => <article key={guide.name}><span>{guide.state}</span><strong>{guide.name}</strong><p>{guide.detail}</p></article>)}</div><p className="connection-boundary-note">仅使用官方授权或你主动导出的文件；不会读取浏览器 Cookie、模拟登录或绕过平台验证。</p></section></section>;
}

function ReviewModule() {
  const [items, setItems] = useState<Array<{ id: string; title: string; nextAction: string | null; status: string }>>([]);
  const [experiments, setExperiments] = useState<Array<{ id: string; name: string; status: string; primaryMetric: string }>>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [title, setTitle] = useState("");
  const [experiment, setExperiment] = useState({ name: "", goal: "", hypothesis: "", variable: "", primaryMetric: "" });
  const load = () => Promise.all([api<typeof items>("/api/reviews"), api<typeof experiments>("/api/experiments")]).then(([reviews, rows]) => { setItems(reviews); setExperiments(rows); }).catch(() => undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);
  useEffect(() => { void api<Account[]>("/api/accounts").then((rows) => { setAccounts(rows); if (rows[0]) setAccountId(rows[0].id); }).catch(() => undefined); }, []);
  return <section className="module-panel"><Header title="Reviews and experiments" description="Separate evidence, hypothesis and next action." /><div className="module-form"><select aria-label="Review account" value={accountId} onChange={(e) => setAccountId(e.target.value)}><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select><input aria-label="Review title" placeholder="Review title" value={title} onChange={(e) => setTitle(e.target.value)} /><button type="button" className="primary-action" onClick={() => { void api("/api/reviews", { method: "POST", body: JSON.stringify({ title, accountId }) }).then(() => { setTitle(""); return load(); }); }}>Add review</button></div><div className="module-table">{items.map((item) => <div className="module-row" key={item.id}><strong>{item.title}</strong><span>{item.status}</span><span>{item.nextAction ?? "Next action pending"}</span></div>)}{items.length === 0 ? <p className="module-empty">No review yet.</p> : null}</div><h2 className="module-subtitle">Experiment registry</h2><div className="module-form"><input aria-label="Experiment name" placeholder="Experiment name" value={experiment.name} onChange={(e) => setExperiment({ ...experiment, name: e.target.value })} /><input aria-label="Experiment goal" placeholder="Goal" value={experiment.goal} onChange={(e) => setExperiment({ ...experiment, goal: e.target.value })} /><input aria-label="Experiment hypothesis" placeholder="Hypothesis" value={experiment.hypothesis} onChange={(e) => setExperiment({ ...experiment, hypothesis: e.target.value })} /><input aria-label="Experiment variable" placeholder="Variable" value={experiment.variable} onChange={(e) => setExperiment({ ...experiment, variable: e.target.value })} /><input aria-label="Experiment metric" placeholder="Primary metric" value={experiment.primaryMetric} onChange={(e) => setExperiment({ ...experiment, primaryMetric: e.target.value })} /><button type="button" className="secondary-action" onClick={() => { void api("/api/experiments", { method: "POST", body: JSON.stringify(experiment) }).then(() => { setExperiment({ name: "", goal: "", hypothesis: "", variable: "", primaryMetric: "" }); return load(); }); }}>Add experiment</button></div><div className="module-table">{experiments.map((item) => <div className="module-row" key={item.id}><strong>{item.name}</strong><span>{item.status}</span><span>{item.primaryMetric}</span></div>)}{experiments.length === 0 ? <p className="module-empty">No experiment yet.</p> : null}</div></section>;
}

function SettingsModule() {
  return (
    <section className="module-panel">
      <Header title="Settings" description="查看本地数据边界、备份策略和恢复预演入口。" />
      <div className="security-summary" role="status">
        <strong>本地优先</strong>
        <span>作品、复盘和收入记录保存在当前设备；平台凭据不进入普通数据备份。</span>
      </div>
      <div className="settings-grid">
        <article>
          <span>本地数据目录</span>
          <strong>Matrix Compass 数据目录</strong>
          <small>安装时选择，和代码仓库保持分离。</small>
        </article>
        <article>
          <span>备份策略</span>
          <strong>关键操作前自动备份</strong>
          <small>导入、升级和恢复前都会创建备份。</small>
        </article>
        <article>
          <span>恢复预演</span>
          <strong>先校验，再恢复</strong>
          <small>恢复预演不会修改当前数据。</small>
        </article>
      </div>
      <section className="security-actions" aria-label="备份与恢复操作">
        <div><strong>需要立即备份？</strong><span>可通过本地 Skill 的备份命令生成可携带副本。</span></div>
        <div><strong>需要恢复？</strong><span>先运行恢复预演，确认备份完整后再执行恢复。</span></div>
      </section>
    </section>
  );
}

export function OperationsModule({ page }: { page: OperationsPage }) {
  if (page === "accounts") return <AccountsModule />;
  if (page === "contents") return <ContentsModule />;
  if (page === "calendar") return <ContentsModule calendar />;
  if (page === "finance") return <FinanceModule />;
  if (page === "sources") return <ImportModule />;
  if (page === "reviews") return <ReviewModule />;
  return <SettingsModule />;
}
