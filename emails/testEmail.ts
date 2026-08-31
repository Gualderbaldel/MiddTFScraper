import fs from "fs";
import { emailV1 } from "./emailV1";

async function main(){


    const {
    rankings,
    athletePrs,
    allNewSchoolRecords
} = JSON.parse(
    fs.readFileSync("test-data/email-data.json", "utf-8")
);
emailV1(
    rankings,
    athletePrs,
    allNewSchoolRecords
);}

main()