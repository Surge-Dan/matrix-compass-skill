import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("real-data empty state exposes the three approved onboarding actions", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: true,
        counts: { accounts: 0, contents: 0 },
        metrics: null,
        actions: ["connect-feishu", "import-file", "create-manually"],
      },
    }),
  );

  for (const label of ["连接飞书", "导入 Excel / CSV", "手动创建第一条记录"]) {
    assert.match(html, new RegExp(label.replace("/", "\\/")));
  }
  assert.doesNotMatch(html, /486,392|演示数据已同步/);
});

test("new navigation contains the confirmed operations modules", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "demo",
        source: "demo",
        readOnly: true,
        needsOnboarding: false,
        counts: { accounts: 6, contents: 139 },
        metrics: { revenueMinor: 243_000, settledMinor: 221_000, pendingMinor: 22_000 },
        actions: [],
      },
    }),
  );

  for (const label of [
    "经营总览",
    "内容日历",
    "内容库",
    "收入管理",
    "账号资产",
    "复盘实验",
    "数据导入与同步",
    "备份与安全",
  ]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /演示模式/);
});

test("backup and security page makes local recovery boundaries visible", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: false,
        counts: { accounts: 2, contents: 9 },
        metrics: null,
        actions: [],
      },
      activePage: "settings",
    }),
  );

  for (const label of ["备份与安全", "本地数据目录", "恢复预演", "导入、升级和恢复前都会创建备份"]) {
    assert.match(html, new RegExp(label));
  }
});

test("real data modules expose Chinese action labels", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: false,
        counts: { accounts: 0, contents: 0 },
        metrics: null,
        actions: ["connect-feishu", "import-file", "create-manually"],
      },
      activePage: "sources",
    }),
  );
  assert.match(html, /预览数据/);
  assert.match(html, /导入目标/);
  assert.match(html, /上传 CSV 或 XLSX/);
});

test("import workflow explains field mapping and official platform boundaries in Chinese", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: false,
        counts: { accounts: 0, contents: 0 },
        metrics: null,
        actions: ["connect-feishu", "import-file", "create-manually"],
      },
      activePage: "sources",
    }),
  );

  for (const label of ["先选数据来源", "字段对应", "微信公众号", "小红书", "抖音", "仅使用官方授权或你主动导出的文件"]) {
    assert.match(html, new RegExp(label));
  }
});

test("non-empty local data never fabricates financial metrics", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: false,
        counts: { accounts: 2, contents: 9 },
        metrics: null,
        actions: ["connect-feishu", "import-file", "create-manually"],
      },
    }),
  );
  assert.match(html, /2 个账号/);
  assert.match(html, /9 条内容/);
  assert.match(html, /无法计算/);
  assert.doesNotMatch(html, /¥0|90\.9%|演示口径|需要跟进/);
});

test("overview prioritizes content direction, sync, backup, and performance trajectory", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "demo",
        source: "demo",
        readOnly: true,
        needsOnboarding: false,
        counts: { accounts: 6, contents: 139 },
        metrics: { revenueMinor: 243_000, settledMinor: 221_000, pendingMinor: 22_000 },
        actions: [],
      },
    }),
  );

  for (const label of ["最近 30 天，内容在变好", "内容航向", "立即同步", "备份状态", "作品表现轨迹"]) {
    assert.match(html, new RegExp(label));
  }
});

test("overview controls are explicitly unavailable until matching local data exists", async () => {
  const { OperationsView } = await import(
    `../components/app/operations-view.tsx?test=${Date.now()}-${Math.random()}`
  );
  const html = renderToStaticMarkup(
    React.createElement(OperationsView, {
      data: {
        mode: "local",
        source: "local-d1",
        readOnly: false,
        needsOnboarding: false,
        counts: { accounts: 2, contents: 9 },
        metrics: null,
        actions: [],
      },
    }),
  );

  assert.match(html, /<button(?=[^>]*disabled="")(?=[^>]*title="导入指标快照后可筛选")/);
  assert.match(html, /<button(?=[^>]*disabled="")(?=[^>]*title="连接平台后可同步")/);
  assert.match(html, /<button(?=[^>]*disabled="")(?=[^>]*title="导入指标快照后可查看依据")/);
});

test("operations shell defines adaptive compass tokens and responsive overview layout", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const token of ["--compass-blue", "--app-surface", "--app-border"]) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.match(css, /\.overview-toolbar/);
  assert.match(css, /\.content-compass/);
  assert.match(css, /\.overview-analysis-grid/);
  assert.match(css, /\.security-summary/);
  assert.match(css, /\.security-actions/);
  assert.match(css, /\.import-workflow/);
  assert.match(css, /\.connection-guide-grid/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*\.overview-analysis-grid/);
});
