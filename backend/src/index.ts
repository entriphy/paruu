import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { db } from "./database";
import morgan from "morgan";
import cors from "cors";
import { sql } from "kysely";
import { DecompStats, GamesTable, SectionsTable } from "./database";

dotenv.config();

const port = process.env.PARUU_PORT || 3001;
const app = express();
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("rupurudu!");
});

app.get("/game", async (req: Request, res: Response) => {
  const query = sql<GamesTable & DecompStats>`
    SELECT
      t1.*,
      CAST(SUM(CASE WHEN t1.id = t2.game_id AND (t2.matching OR t2.ez OR t2.dc_progress = 100.0) THEN 1 ELSE 0 END) AS INT) as decomp,
      CAST(SUM(CASE WHEN t1.id = t2.game_id THEN 1 ELSE 0 END) AS INT) as total
    FROM game AS t1, entry AS t2
    GROUP BY t1.id
  `;
  res.json((await query.execute(db)).rows);
});

app.get("/section/:game", async (req: Request, res: Response) => {
  const query = sql<SectionsTable & DecompStats>`
    SELECT
      t1.*,
      CAST(SUM(CASE WHEN t1.game_id = t2.game_id AND t1.id = t2.section AND (t2.matching OR t2.ez OR t2.dc_progress = 100.0) THEN 1 ELSE 0 END) AS INT) as decomp,
      CAST(SUM(CASE WHEN t1.game_id = t2.game_id AND t1.id = t2.section THEN 1 ELSE 0 END) AS INT) as total
    FROM section AS t1, entry AS t2
    WHERE t1.game_id = ${req.params.game}
    GROUP BY t1.id, t1.game_id
  `;

  // const query = db
  //   .selectFrom(["sections as t1", "entries as t2"])
  //   .selectAll("t1")
  //   .select((eb) => [
  //     eb.fn('SUM', [eb.case().when(eb.and([
  //       eb("t1.game_id", "=", "t2.game_id"),
  //       eb("t1.id", "=", "t2.section"),
  //     ])).then(1).else(0).end()]).as("total"),
  //   ])
  //   .where("t1.game_id", "=", req.params.game)
  //   .groupBy(["t1.id", "t1.game_id"]);

  res.json((await query.execute(db)).rows);
});

app.get("/entry/:game/:section", async (req: Request, res: Response) => {
  let query = db.selectFrom("entry")
    .selectAll()
    .orderBy("address", "asc")
    .where("game_id", "=", req.params.game);
  if (req.params.section !== "all") {
    query = query.where("section", "=", req.params.section);
  }
  res.json(await query.execute());
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

