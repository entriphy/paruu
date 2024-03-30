import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable("games")
        .addColumn("id", "varchar", (col) => col.notNull().primaryKey())
        .addColumn("title", "varchar", (col) => col.notNull())
        .addColumn("description", "varchar", (col) => col.notNull())
        .execute();
    
    await db.schema.createTable("sections")
        .addColumn("id", "varchar", (col) => col.notNull())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("games.id"))
        .addColumn("name", "varchar", (col) => col.notNull())
        .addColumn("description", "varchar", (col) => col.notNull())
        .addPrimaryKeyConstraint("sections_primary_key", ["id", "game_id"])
        .execute();

    await db.schema.createTable("entries")
        .addColumn("address", "integer", (col) => col.notNull())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("games.id"))
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
    
    await db.schema.createTable("tokens")
        .addColumn("token", "varchar", (col) => col.notNull().primaryKey())
        .addColumn("game_id", "varchar", (col) => col.notNull().references("games.id"))
        .addColumn("github_id", "integer", (col) => col.notNull())
        .addColumn("description", "varchar")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("entries").execute();
    await db.schema.dropTable("sections").execute();
    await db.schema.dropTable("tokens").execute();
    await db.schema.dropTable("games").execute();
}

