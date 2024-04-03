import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("game").addColumn("repository", "varchar").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("game").dropColumn("repository").execute();
}
