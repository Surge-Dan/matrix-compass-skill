import { validateContentInput } from "../domain/content";
import { validateAccountInput } from "../domain/account";
import { validateFinanceInput } from "../domain/finance";

export type ImportTarget = "accounts" | "contents" | "finance";
export interface ImportError { row: number; message: string; field?: string; }

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, "").trim();
}

export function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() ?? []).map(normalizeHeader);
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function mapPlatform(value: string) { return validateAccountInput({ platform: value, name: "import" }).platform; }

function pick(row: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function toDateTime(value: string) {
  if (!value) return null;
  return value.includes("T") || /Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}T00:00:00+08:00`;
}

function mapStage(value: string) {
  const normalized = value.toLocaleLowerCase("zh-CN");
  if (["已发布", "published", "done"].includes(normalized)) return "published" as const;
  if (["草稿", "draft"].includes(normalized)) return "draft" as const;
  return "scheduled" as const;
}

export function mapImportRows(rows: Record<string, string>[], target: ImportTarget) {
  const valid: Record<string, unknown>[] = [];
  const errors: ImportError[] = [];
  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    try {
      if (target === "accounts") {
        const account = validateAccountInput({ platform: pick(row, "平台", "platform", "Platform"), name: pick(row, "账号", "账号名称", "account", "account_name", "name") });
        valid.push(account);
      } else if (target === "contents") {
        const platform = mapPlatform(pick(row, "平台", "platform", "Platform"));
        const accountName = pick(row, "账号", "账号名称", "account", "account_name", "name");
        const title = pick(row, "内容主题", "标题", "title", "content_title");
        const plannedAt = toDateTime(pick(row, "发布时间", "发布日期", "date", "planned_at", "publish_date"));
        const stage = mapStage(pick(row, "发布状态", "stage", "status"));
        const content = validateContentInput({ title, accountId: `${platform}:${accountName}`, plannedAt, stage });
        valid.push({ ...content, platform, accountName });
      } else {
        const platform = mapPlatform(pick(row, "平台", "platform", "Platform"));
        const accountName = pick(row, "账号", "账号名称", "account", "account_name", "name");
        const input = validateFinanceInput({
          accountId: `${platform}:${accountName}`,
          direction: pick(row, "收支方向", "方向", "direction") || "income",
          category: pick(row, "收入类型", "类型", "category") || "other",
          amountMinor: Math.round(Number(pick(row, "金额", "收入金额", "amount")) * 100),
          currency: pick(row, "币种", "currency") || "CNY",
          occurredAt: toDateTime(pick(row, "发生日期", "日期", "occurred_at", "date")) ?? "",
          settlementStatus: pick(row, "结算状态", "settlement_status") || "pending",
          settledAmountMinor: Math.round(Number(pick(row, "已结算金额", "settled_amount")) * 100),
        });
        valid.push({ ...input, platform, accountName });
      }
    } catch (error) {
      errors.push({ row: rowNumber, message: error instanceof Error ? error.message : "数据无效" });
    }
  });
  return { valid, errors };
}
