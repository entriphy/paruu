import { FileMigrationProvider, Migrator } from "kysely"
import { promises as fs } from "fs"
import path from "path"
import { db } from "./database";
import enquirer from "enquirer";
import { createInterface } from "readline";

const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, "..", "migrations"),
    })
})

async function migrateToLatest() {
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === "Success") {
            console.log(`Migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === "Error") {
            console.error(`Failed to execute migration "${it.migrationName}"`)
        }
    });

    if (error) {
        console.error("Failed to migrate");
        console.error(error);
        process.exit(1);
    }

    await db.destroy();
}

async function migrateDown() {
    const { error, results } = await migrator.migrateDown();

    results?.forEach((it) => {
        if (it.status === "Success") {
            console.log(`Migration down "${it.migrationName}" was executed successfully`)
        } else if (it.status === "Error") {
            console.error(`Failed to execute migration down "${it.migrationName}"`)
        }
    });

    if (error) {
        console.error("Failed to migrate down");
        console.error(error);
        process.exit(1);
    }

    await db.destroy();
}

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("1) Migrate to latest");
console.log("2) Migrate down");

rl.question("Select an action: ", function(answer) {
    rl.close();
    switch (answer) {
        case "1": migrateToLatest(); break;
        case "2": migrateDown(); break;
    }    
});


