import { Pool } from "pg";
import { Generated, Kysely, PostgresDialect } from "kysely";

export interface Database {
    game: GamesTable,
    section: SectionsTable,
    entry: EntriesTable,
    token: TokensTable
};

export interface GamesTable {
    id: string;
    title: string;
    description: string;
    repository: string | null;
};

export interface SectionsTable {
    id: string;
    game_id: string;
    name: string;
    description: string;
};

export interface EntriesTable {
    address: number;
    game_id: string;
    section: string | null;
    name: string | null;
    implemented: Generated<boolean>;
    matching: Generated<boolean>;
    ez: Generated<boolean>;
    note: string | null;
    dc_id: string | null;
    dc_progress: number | null;
    source_file: string | null;
};

export interface TokensTable {
    token: string;
    game_id: string;
    github_id: number;
    description: string | null;
};

export interface DecompStats {
    decomp: number;
    total: number;
};

export interface EntryUpdate {
    address: number;
    matching: boolean;
    source_file: string;
};

const dialect = new PostgresDialect({
    pool: new Pool({
        database: process.env.NODE_ENV === "production" ? "paruu" : "paruu_dev",
        host: process.env.POSTGRES_HOST || "localhost",
        user: process.env.POSTGRES_USER || "paruu",
        password: process.env.POSTGRES_PASS || "paruu",
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        max: 10
    })
});

export const db = new Kysely<Database>({
    dialect: dialect
});
