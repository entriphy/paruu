import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable("game")
        .addColumn("id", "varchar", (col) => col.notNull().primaryKey())
        .addColumn("title", "varchar", (col) => col.notNull())
        .addColumn("description", "varchar", (col) => col.notNull())
        .execute();
    
    await db.schema.createTable("section")
        .addColumn("id", "varchar", (col) => col.notNull())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("game.id"))
        .addColumn("name", "varchar", (col) => col.notNull())
        .addColumn("description", "varchar", (col) => col.notNull())
        .addPrimaryKeyConstraint("sections_primary_key", ["id", "game_id"])
        .execute();

    await db.schema.createTable("entry")
        .addColumn("address", "integer", (col) => col.notNull())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("game.id"))
        .addColumn("section", "varchar")
        .addColumn("name", "varchar")
        .addColumn("implemented", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("matching", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("ez", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("note", "varchar")
        .addColumn("dc_id", "varchar")
        .addColumn("dc_progress", "float8")
        // There could be functions at the same address across different games, so include game_id in the primary key
        .addPrimaryKeyConstraint("entries_primary_key", ["address", "game_id"])
        .addCheckConstraint("check_dc", sql`
            (dc_id IS NOT NULL AND dc_progress IS NOT NULL)
            OR
            (dc_id IS NULL AND dc_progress IS NULL)`
        )
        .execute();
    
    await db.schema.createTable("token")
        .addColumn("token", "varchar", (col) => col.notNull().primaryKey())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("game.id"))
        .addColumn("github_id", "integer", (col) => col.notNull())
        .addColumn("description", "varchar")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("entry").execute();
    await db.schema.dropTable("section").execute();
    await db.schema.dropTable("token").execute();
    await db.schema.dropTable("game").execute();
}

