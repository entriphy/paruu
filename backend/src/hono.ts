import { Context, Hono } from "hono";
import { cors } from 'hono/cors'
import { Database } from "./database";
import { env } from "hono/adapter";
import App from "./app";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

interface Env {
    ENVIRONMENT?: string
    POSTGRES_HOST?: string;
    POSTGRES_USER?: string;
    POSTGRES_PASS?: string;
    POSTGRES_PORT?: string;
    CORS_ORIGIN?: string;
}

function createDb(c: Context): Kysely<Database> {
    const environ: Env = env(c);
    const db = new Kysely<Database>({
        dialect: new PostgresDialect({
            pool: new Pool({
                database: environ.ENVIRONMENT === "production" ? "paruu" : "paruu_dev",
                host: environ.POSTGRES_HOST || "localhost",
                user: environ.POSTGRES_USER || "paruu",
                password: environ.POSTGRES_PASS || "paruu",
                port: parseInt(environ.POSTGRES_PORT || "5432"),
                max: 10
            })
        })
    });
    return db;
}

const app = new Hono();
app.use("*", (c, next) => {
    const environ: Env = env(c);
    const wrapped = cors({
        origin: environ.CORS_ORIGIN ?? "*",
    })
    return wrapped(c, next)
})
app.get("/", (c: Context) => c.text("rupurudu!"));
app.get("/game", async (c: Context) => c.json(await (new App(createDb(c), true)).getGames()));
app.get("/section/:game", async (c: Context) => c.json(await (new App(createDb(c), true)).getSections(c.req.param("game"))));
app.get("/entry/:game/:section", async (c: Context) => c.json(await (new App(createDb(c), true)).getEntries(c.req.param("game"), c.req.param("section"))));
app.post("/entry/:game", async (c: Context) => c.json(await (new App(createDb(c), true)).updateEntries(c.req.param("game"), await c.req.json(), c.req.header("Authorization") || "")));

export default app;