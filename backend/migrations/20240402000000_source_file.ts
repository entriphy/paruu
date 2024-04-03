import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("entry").addColumn("source_file", "varchar").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("entry").dropColumn("source_file").execute();
}
