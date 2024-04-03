import { Kysely, sql } from "kysely";
import { Database, DecompStats, EntriesTable, GamesTable, SectionsTable } from "./database";

export default class App {
    private db: Kysely<Database>;
    private destroyAfterReq: boolean;

    constructor(db: Kysely<Database>, destroyAfterReq: boolean = false) {
        this.db = db;
        this.destroyAfterReq = destroyAfterReq;
    }

    public async getGames() {
        const query = sql<GamesTable & DecompStats>`
            SELECT
                game.*,
                COALESCE(f.decomp, 0) AS decomp,
                COALESCE(f.total, 0) AS total,
                g.sections
            FROM game
            LEFT JOIN (SELECT 
                        game_id, 
                        CAST(SUM(CASE WHEN entry.matching OR entry.ez OR entry.dc_progress = 100.0 THEN 1 ELSE 0 END) AS INT) as decomp,
                        CAST(COUNT(entry.address) AS INT) AS total
                    FROM entry
                    GROUP BY game_id) f on game.id = f.game_id
            LEFT JOIN (SELECT 
                        game_id, 
                        json_object_agg(id, name) as sections
                    FROM section
                    GROUP BY section.game_id) g ON game.id = g.game_id
        `;

        const res = (await query.execute(this.db)).rows;
        if (this.destroyAfterReq) await this.destroy();

        return res;
    }

    public async getSections(game: string) {
        const query = sql<SectionsTable & DecompStats>`
            SELECT
                t1.*,
                CAST(SUM(CASE WHEN t1.game_id = t2.game_id AND t1.id = t2.section AND (t2.matching OR t2.ez OR t2.dc_progress = 100.0) THEN 1 ELSE 0 END) AS INT) as decomp,
                CAST(SUM(CASE WHEN t1.game_id = t2.game_id AND t1.id = t2.section THEN 1 ELSE 0 END) AS INT) as total
            FROM section AS t1, entry AS t2
            WHERE t1.game_id = ${game}
            GROUP BY t1.id, t1.game_id
        `;

        const res = (await query.execute(this.db)).rows;;
        if (this.destroyAfterReq) await this.destroy();

        return res;
    }

    public async getEntries(game: string, section: string) {
        let query = this.db.selectFrom("entry")
            .selectAll()
            .orderBy("address", "asc")
            .where("game_id", "=", game);
        
        if (section !== "all") {
            query = query.where("section", "=", section);
        }

        const res = await query.execute();
        if (this.destroyAfterReq) await this.destroy();

        return res;
    }

    public async destroy() {
        await this.db.destroy();
    }
};