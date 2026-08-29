import type { Page } from "@playwright/test";
import { AthletePage } from "../page_objects/AthletePage";
import type { Athlete, PersonalRecord, Performance } from "../types";
import "dotenv/config";
import {
    addToPersonalRecordHistory,
    fetchAllPersonalRecords,
    fetchSchoolRecord,
    insertPersonalRecord,
    updatePersonalRecord,
    insertSchoolRecord,
    updateSchoolRecord
} from "./helpers";

export async function evaluatePrs(page: Page, athlete: Athlete, outdoor: boolean): Promise<{
    updatedRecords: PersonalRecord[],
    hasUpdates: boolean,
    newSchoolRecords: PersonalRecord[] }> {
    const athletePage = new AthletePage(page);


    await athletePage.goto(athlete.url);

    //const meets = await athletePage.getMeetResults().allTextContents();
    //console.log("meets:", meets.map(meet => meet.replace(/\s+/g, " ").trim()));

    const prs = await athletePage.getPRs().allTextContents();

    //console.log("PRs:", prs.map(pr => pr.replace(/\s+/g, " ").trim()));

    const prObjects = prs.map(pr => {
        const match = pr
            .replace(/\s+/g, " ")
            .trim()
            .match(/^(\d+[A-Za-z]*)\s+([\d.:]+)/);
        return match ? { event: match[1], time: String(match[2]), } : null
    }).filter(object => object !== null)

    const updatedRecords: PersonalRecord[] = [];
    const newSchoolRecords: PersonalRecord[] = [];

    const { existingAthlete, fetchError } = (await fetchAllPersonalRecords(athlete))
    if (fetchError) {
        console.error(
            `Error checking ${athlete.name}:`,
            fetchError.message
        );
        return {
            updatedRecords,
            hasUpdates: updatedRecords.length > 0,
            newSchoolRecords
        };
    }
    const athletePrs = existingAthlete ?? [] as Performance[];
    const prMap = new Map(
        athletePrs.map(pr => [pr.event, pr])
    );

    for (const pr of prObjects) {
        const existingEvent = prMap.get(pr.event);

        if (!existingEvent) {
            console.error(
                `${athlete.name}'s ${pr.event} pr does not exist in database... adding...`)
            const { insertError } = await insertPersonalRecord(pr, athlete);
            if (insertError) {
                console.error(
                    `Error inserting ${athlete.name}:`,
                    insertError.message
                );
            } else {
                console.log(`Inserted ${athlete.name}'s ${pr.event} pr into the database.`);
            }
        } else if (parseTime(existingEvent.time) > parseTime(pr.time)) {
            await updatePersonalRecord(pr, athlete)
            const delta = (parseTime(pr.time) - parseTime(existingEvent.time)).toFixed(2);
            console.log(`Athlete: ${athlete.name} PR of ${pr.time} for ${pr.event} updated (delta of ${delta}s)`);
            updatedRecords.push({
                time: pr.time,
                event: pr.event,
                delta: delta,
                athlete: {
                    name: athlete.name,
                    id: athlete.id,
                },
            })
            const { error } = await addToPersonalRecordHistory(pr, athlete, Number(delta), existingEvent.time)
            if (error) {
                console.error("oopsies there is this error:", error.message)
            }
            const { schoolRecord, fetchError } = await fetchSchoolRecord(pr.event, outdoor)
            if (fetchError) {
                console.error("oopsies there is this error with grabbing the school record:", fetchError.message)
            }
            const thisYear = String(new Date().getFullYear())
            if (!schoolRecord) {
                console.log(
                    `School Record for the ${pr.event} does not exist in database... adding...`)
                await insertSchoolRecord(pr, athlete.name, thisYear, outdoor)
                newSchoolRecords.push({
                time: pr.time,
                event: pr.event,
                athlete: {
                    name: athlete.name,
                    id: athlete.id,
                },
            })
            }
            if(parseTime(pr.time) <= parseTime(schoolRecord.time)){
                await updateSchoolRecord(pr, athlete.name, String(new Date().getFullYear()), outdoor)
                console.log(`New School Record for ${athlete.name} in the ${pr.event} with a time of ${pr.time}`)
                newSchoolRecords.push({
                time: pr.time,
                event: pr.event,
                yearsSinceBroken: String(Number(thisYear) - Number(schoolRecord.year)),
                athlete: {
                    name: athlete.name,
                    id: athlete.id,
                },
            })
            }else console.log(`not a school Record for ${athlete.name} in ${pr.event}`)


        }
    }
    return {
        updatedRecords,
        hasUpdates: updatedRecords.length > 0,
        newSchoolRecords
    }
}
/*
async function main(){
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await evaluatePrs(page, {
        name: "Gardner, Nathaniel",
        url: "https://www.tfrrs.org/athletes/9008356/Middlebury/Nathaniel_Gardner.html",
        id: "9008356",
    })
}
main();
*/
function parseTime(time: string): number {
    time = time.replace("#", "").trim();
    if (time.includes(":")) {
        const [minutes, seconds] = time.split(":").map(Number);
        return minutes * 60 + seconds;
    }

    return Number(time);
}