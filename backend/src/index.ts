import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { db } from "./database";
import App from "./app";

const server = new App(db);
const app: Express = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.get("/", (req: Request, res: Response) => { res.send("rupurudu!"); });
app.get("/game", async (req: Request, res: Response) => { res.json(await server.getGames()); });
app.get("/section/:game", async (req: Request, res: Response) => { res.json((await server.getSections(req.params.game))); });
app.get("/entry/:game/:section", async (req: Request, res: Response) => { res.json(await server.getEntries(req.params.game, req.params.section)); });
app.post("/entry/:game", async (req: Request, res: Response) => { res.json(await server.updateEntries(req.params.game, req.body, req.headers.authorization || "")); });
app.get("/badge/:game", async (req: Request, res: Response) => { res.json((await server.getProgressBadge(req.params.game))); });

const port = parseInt(process.env.PARUU_PORT || "3001")
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

