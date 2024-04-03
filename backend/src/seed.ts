import { InsertObject, Kysely } from "kysely"
import { db } from "./database";
import { Database } from "./database";
import { parse } from "csv-parse";

async function asyncParse(input: string): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        parse(input, (err, cb) => {
            if (err) {
                reject(err);
            } else {
                resolve(cb);
            }
        })
    });
}

async function seedGames(db: Kysely<Database>): Promise<void> {
    console.log("Clearing entries...");
    await db.deleteFrom("entry")
        .where((eb) => eb.or([
            eb("game_id", "=", "dtp"),
            eb("game_id", "=", "lv")
        ]))
        .execute();
    console.log("Clearing sections...");
    await db.deleteFrom("section")
        .where((eb) => eb.or([
            eb("game_id", "=", "dtp"),
            eb("game_id", "=", "lv")
        ]))
        .execute();
    console.log("Clearing games...");
    await db.deleteFrom("game")
        .execute();

    console.log("Inserting games...");
    await db.insertInto("game").values([
        { id: "dtp", title: "Klonoa: Door to Phantomile", description: "Sony PlayStation" },
        { id: "lv", title: "Klonoa 2: Lunatea's Veil", description: "Sony PlayStation 2", repository: "https://github.com/entriphy/kl2_lv_decomp" },
    ]).execute();
}

async function seedDTP(db: Kysely<Database>): Promise<void> {
    console.log("Clearing entries...");
    await db.deleteFrom("entry")
        .where("game_id", "=", "dtp")
        .execute();
    console.log("Clearing sections...");
    await db.deleteFrom("section")
        .where("game_id", "=", "dtp")
        .execute();

    console.log("Inserting sections...");
    await db.insertInto("section").values([
        { game_id: "dtp", id: "test", name: "Test", description: "Test" }
    ]).execute();
}

async function seedLV(db: Kysely<Database>): Promise<void> {
    const symbolAddrsUrl = "https://raw.githubusercontent.com/entriphy/kl2_lv_decomp/main/tools/symbol_addrs_all.txt";
    const symbolAddrsRegex = /(.+) +?= *(0x[0-9a-fA-F]+);(?: *\/\/\s*(.+:.+)+)?/g;
    const progressCsvUrl = "https://docs.google.com/spreadsheets/d/190e6yPZklUfM2ye2Pkpta4B5KNp9lJFB0Ldx90eCVzU/gviz/tq?tqx=out:csv&sheet=Functions"
    const dcProgressRegex = /(\d+) \((\d+\.\d+)%(, O)?\)/;
    const sections: {
        id: string;
        name: string;
        description: string;
        start: number;
        end: number
    }[] = [
        { id: "abe", name: "Abe", description: "Test/sample functions", start: 0x00100130, end: 0x001013E0 },
        { id: "harada", name: "Harada", description: "Puppet (cutscenes), map rendering (VPM/VPA)", start: 0x00101628, end: 0x0011FDA0 },
        { id: "hato", name: "Hato", description: "Boss programming", start: 0x00120388, end: 0x001659D0 },
        { id: "hoshino", name: "Hoshino", description: "Sound and CD programming", start: 0x00165A20, end: 0x00170D50 },
        { id: "kazuya", name: "Kazuya", description: "Menu logic, world map", start: 0x00170D88, end: 0x0018A900 },
        { id: "nakano", name: "Nakano", description: "System programming, routes, collision detection, Popka", start: 0x0018AA20, end: 0x001B6228 },
        { id: "okano", name: "Okano", description: "Entity (enemies, items) programming", start: 0x001B6B50, end: 0x00205978 },
        { id: "take", name: "Takeshi", description: "Model (SFX) rendering, title screen", start: 0x00205988, end: 0x0021D370 },
        { id: "vt", name: "VT", description: "Video animations", start: 0x0021D5B8, end: 0x0021E168 },
        { id: "kit", name: "Kit", description: "Model outline rendering", start: 0x0021E198, end: 0x0021EE58 },
        { id: "nakano_gim", name: "Nakano Gimmick", description: "Puzzle stuff", start: 0x0021EE60, end: 0x00229830 },
        { id: "okano_debug", name: "Okano Debug", description: "Debug stuff", start: 0x00229888, end: 0x0022A698 },
        { id: "wave", name: "Wave", description: "Wave and spray animations", start: 0x0022A7F8, end: 0x0023A378 },
        { id: "abe_cpp", name: "Abe C++", description: "Visual effects (smoke, lightning, etc)", start: 0x0023A3E8, end: 0x002D9EF0 },
        { id: "hoshino_cpp", name: "Hoshino C++", description: "End credits", start: 0x002DA058, end: 0x002DA2B0 },
        { id: "nakano_cpp", name: "Nakano C++", description: "Controller inputs", start: 0x002DA380, end: 0x002DB750 },
        { id: "taka_cpp", name: "Taka C++", description: "Boss visual effects", start: 0x002DB760, end: 0x002FCDF8 },
    ];

    console.log("Clearing entries...");
    await db.deleteFrom("entry")
        .where("game_id", "=", "lv")
        .execute();
    console.log("Clearing sections...");
    await db.deleteFrom("section")
        .where("game_id", "=", "lv")
        .execute();

    console.log("Inserting sections...");
    await db.insertInto("section").values(sections.map((section) => {
        return { game_id: "lv", id: section.id, name: section.name, description: section.description }
    })).execute();

    console.log("Parsing symbols...");
    const entries: { [address: number]: InsertObject<Database, "entry"> } = {}
    const symbolsAddrs = await fetch(symbolAddrsUrl);
    const symbols = (await symbolsAddrs.text()).matchAll(symbolAddrsRegex);
    for (const symbol of symbols) {
        const name = symbol[1].startsWith("func_") ? null : symbol[1];
        const address = parseInt(symbol[2], 16);
        const params = symbol[3].split(" ").map((param) => param.split(":")).reduce<{ [k: string]: string }>((acc, curr) => { acc[curr[0]] = curr[1]; return acc; }, {} );
        if (params["type"] != "func" || address < sections[0].start || address > sections[sections.length - 1].end) {
            continue;
        }
        const section = sections.find((v, i) => v.start <= address && address <= v.end)?.id;
        if (section === undefined) {
            console.error(`Could not find section for address: 0x00${address.toString(16)}`);
            continue;
        }

        entries[address] = {address: address, game_id: "lv", section: section, name: name}
    }

    console.log("Parsing progress CSV...");
    const progressCsv = await fetch(progressCsvUrl);
    const csv = await asyncParse(await progressCsv.text());
    for (const entry of csv.slice(1)) {
        if (entry[0] === "")
            continue;
        const address = parseInt(entry[0]);
        if (address < sections[0].start || address > sections[sections.length - 1].end)
            continue;
        if (entry[6] !== "") {
            entries[address].note = entry[6];
        }
        if (entry[7] === "EZ") {
            entries[address].ez = true;
        } else if (entry[7].startsWith("https://decomp.me")) {
            entries[address].dc_id = entry[7].split("/").pop();
            const dcProgress = dcProgressRegex.exec(entry[8]) as RegExpExecArray;
            entries[address].dc_progress = dcProgress[3] !== undefined ? 100.0 : parseFloat(dcProgress[2]);
        }
    }

    console.log("Inserting entries...");
    await db.insertInto("entry").values(Object.values(entries)).execute();
}

const seeds: {
    name: string;
    seed: (db: Kysely<any>) => Promise<void>;
}[] = [
    { name: "Games", seed: seedGames },
    { name: "Klonoa: Door to Phantomile", seed: seedDTP},
    { name: "Klonoa 2: Lunatea's Veil", seed: seedLV}
]

async function main() {
    for (const seed of seeds) {
        console.log(`Running seed ${seed.name}...`);
        await seed.seed(db);
    }
    console.log("Success!");
    await db.destroy();
}

main();