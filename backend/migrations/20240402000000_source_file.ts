import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("entry")
        .addColumn("source_file", "varchar")
        .execute();
    await db.schema.alterTable("entry")
        .addCheckConstraint("check_src", sql`
            implemented = TRUE AND source_file IS NOT NULL
        `)
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("entry").dropConstraint("check_src").execute();
    await db.schema.alterTable("entry").dropColumn("source_file").execute();
}
