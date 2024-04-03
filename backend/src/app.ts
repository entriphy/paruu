import { Kysely, sql } from "kysely";
import { Database, DecompStats, EntryUpdate, GamesTable, SectionsTable } from "./database";

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
                section.*,
                e.decomp,
                e.total
            FROM section
            LEFT JOIN (SELECT 
                        game_id,
                        section,
                        CAST(SUM(CASE WHEN matching OR ez OR dc_progress = 100.0 THEN 1 ELSE 0 END) AS INT) AS decomp,
                        CAST(COUNT(address) AS INT) AS total
                    FROM entry
                    GROUP BY game_id, section) e ON section.game_id = e.game_id AND section.id = e.section
            WHERE section.game_id = 'lv'
            GROUP BY section.id, section.game_id, e.decomp, e.total
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

    public async updateEntries(game: string, entries: EntryUpdate[], token: string) {
        let tokenQuery = await this.db.selectFrom("token")
            .select("game_id")
            .where("token", "=", token)
            .where("game_id", "=", game)
            .execute();
        if (tokenQuery.length === 0) {
            return {"success": false, "error": "Unauthorized token"}
        }

        let query = this.db.updateTable("entry")
            .set("implemented", (eb) => eb.case().when("address", "in", entries.map((e) => e.address)).then(true).else(false).end())
            .set("source_file", (eb) => {
                let c: any = eb.case(); // :(
                entries.forEach((e) => {
                    c = c.when("address", "=", e.address).then(e.source_file);
                });
                return c.end();
            })
            .set("matching", (eb) => eb.case().when("address", "in", entries.filter((v) => v.matching).map((e) => e.address)).then(true).else(false).end())
            .where("game_id", "=", game);
        
        const res = await query.execute();
        if (this.destroyAfterReq) await this.destroy();

        return {"success": true};
    }

    public async destroy() {
        await this.db.destroy();
    }
};