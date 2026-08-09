import { describe, expect, it } from "vitest";
import { createTestDatabase, migrateToV2, readMigration } from "../helpers/d1";
import { applyVersionedMigrationSql } from "../../db/migrate";

describe("operations APIs", () => {
  it("does not treat the framework route context as a database binding", async () => {
    const previousMode = process.env.MATRIX_COMPASS_MODE;
    process.env.MATRIX_COMPASS_MODE = "local";
    try {
      const { GET } = await import("../../app/api/accounts/route");
      const response = await (GET as unknown as (request: Request, context: unknown) => Promise<Response>)(new Request("http://localhost/api/accounts"), { params: {} });
      expect(response.status).toBe(503);
      const payload = await response.json() as { data: { code: string } };
      expect(payload.data.code).toBe("DATABASE_UNAVAILABLE");
    } finally {
      if (previousMode === undefined) delete process.env.MATRIX_COMPASS_MODE;
      else process.env.MATRIX_COMPASS_MODE = previousMode;
    }
  });

  it("creates an account and a content record through the API handlers", async () => {
    const { miniflare, database } = await createTestDatabase();
    await migrateToV2(database);
    await applyVersionedMigrationSql(database, await readMigration("0003_operations_modules.sql"), 3);
    const { createAccountsResponse } = await import("../../app/api/accounts/route");
    const accountResponse = await createAccountsResponse(new Request("http://localhost/api/accounts", { method: "POST", body: JSON.stringify({ platform: "公众号", name: "Daniel" }), headers: { "content-type": "application/json" } }), database, "mc-test-account");
    expect(accountResponse.status).toBe(201);
    const account = await accountResponse.json() as { data: { id: string } };
    const { createContentsResponse } = await import("../../app/api/contents/route");
    const contentResponse = await createContentsResponse(new Request("http://localhost/api/contents", { method: "POST", body: JSON.stringify({ accountId: account.data.id, title: "AI 复盘", plannedAt: "2026-08-08T08:00:00+08:00", stage: "scheduled" }), headers: { "content-type": "application/json" } }), database, "mc-test-content");
    expect(contentResponse.status).toBe(201);
    await miniflare.dispose();
  });
});
