import { describe, expect, it } from "vitest";
import { commitImport, previewImport, rollbackImport } from "../../lib/imports/service";
import { createTestDatabase, migrateToV2, readMigration } from "../helpers/d1";
import { applyVersionedMigrationSql } from "../../db/migrate";

describe("import service", () => {
  it("imports account rows with their actual account name", async () => {
    const { miniflare, database } = await createTestDatabase();
    await migrateToV2(database);
    await applyVersionedMigrationSql(database, await readMigration("0003_operations_modules.sql"), 3);
    await applyVersionedMigrationSql(database, await readMigration("0004_import_lineage.sql"), 4);
    const preview = previewImport("platform,account\nwechat,Daniel", "accounts");
    await expect(commitImport(database, preview)).resolves.toMatchObject({ status: "committed", successRows: 1 });
    await expect(database.prepare("SELECT platform, name FROM accounts WHERE deleted_at IS NULL").all()).resolves.toMatchObject({ results: [{ platform: "wechat", name: "Daniel" }] });
    await miniflare.dispose();
  });

  it("does not report a successful batch when every row is invalid", async () => {
    const { miniflare, database } = await createTestDatabase();
    await migrateToV2(database);
    await applyVersionedMigrationSql(database, await readMigration("0003_operations_modules.sql"), 3);
    await applyVersionedMigrationSql(database, await readMigration("0004_import_lineage.sql"), 4);
    const preview = previewImport("platform,account\nunknown,", "accounts");
    await expect(commitImport(database, preview)).rejects.toThrow("没有可写入的有效行");
    await miniflare.dispose();
  });

  it("previews and commits content rows as one local batch", async () => {
    const { miniflare, database } = await createTestDatabase();
    await migrateToV2(database);
    await applyVersionedMigrationSql(database, await readMigration("0003_operations_modules.sql"), 3);
    await applyVersionedMigrationSql(database, await readMigration("0004_import_lineage.sql"), 4);
    const preview = previewImport("平台,账号,内容主题,发布日期\n公众号,Daniel,AI 复盘,2026-08-08", "contents");
    await expect(commitImport(database, preview, "csv", "contents.csv")).resolves.toMatchObject({ status: "committed", successRows: 1 });
    await expect(database.prepare("SELECT COUNT(*) AS count FROM accounts").first()).resolves.toEqual({ count: 1 });
    await expect(database.prepare("SELECT COUNT(*) AS count FROM contents").first()).resolves.toEqual({ count: 1 });
    const batch = await database.prepare("SELECT id FROM import_batches LIMIT 1").first<{ id: string }>();
    await expect(rollbackImport(database, batch!.id)).resolves.toMatchObject({ status: "rolled-back" });
    await expect(database.prepare("SELECT COUNT(*) AS count FROM contents WHERE deleted_at IS NULL").first()).resolves.toEqual({ count: 0 });
    await miniflare.dispose();
  });
});
