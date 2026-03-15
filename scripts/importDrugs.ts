import fs from "fs"
import path from "path"
import { db } from "../lib/db"
import { drugs } from "../lib/db/schema"

async function importDrugs() {

  const filePath = path.join(process.cwd(), "drugs.json")
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"))

  const formatted = raw.map((drug: any) => ({
    ...drug,
    createdat: new Date(drug.createdat),
    updatedat: new Date(drug.updatedat)
  }))

  await db.insert(drugs).values(formatted)

  console.log("Drugs imported successfully")
}

importDrugs()