import fs from "node:fs";
import { chromium } from "@playwright/test";
import { emailV1 } from "./emails/emailV1";
import { athleteLinks } from "./scrapers/athlete";
import { evaluatePrs } from "./scrapers/evaluatePrs";
import { athleteRankings } from "./scrapers/ranks";
import { scrapeMiddTF } from "./scrapers/scraper";
import type { PersonalRecord } from "./types/types";

async function main() {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	const currentDate = new Date();
	const isOutdoorSeason =
		currentDate.getMonth() >= 2 && currentDate.getMonth() <= 10; //March to November
	const merged = await scrapeMiddTF(page, isOutdoorSeason);
	const rankings = await athleteRankings(merged, isOutdoorSeason);
	const athletes = await athleteLinks(page);
	const allPrs: PersonalRecord[][] = [];
	const allSchoolRecords: PersonalRecord[][] = [];
	for (const athlete of athletes) {
		const newPrs = await evaluatePrs(page, athlete, isOutdoorSeason);
		allPrs.push(newPrs.updatedRecords);
		allSchoolRecords.push(newPrs.newSchoolRecords);
	}
	const allNewPrs = allPrs.filter((pr) => pr.length > 0);
	const athletePrs = [
		...new Map(allNewPrs.map((pr) => [pr[0].athlete.name, pr])),
	];
	const allNewSchoolRecords = allSchoolRecords.filter((pr) => pr.length > 0);
	fs.writeFileSync(
		"test-data/email-data.json",
		JSON.stringify(
			{
				rankings,
				athletePrs,
				allNewSchoolRecords,
			},
			null,
			2,
		),
	);
	//const athleteSrs = [... new Map(allNewSchoolRecords.map(pr => [pr[0].athlete.name, pr]))]
	await browser.close();
	await emailV1(rankings, athletePrs, allNewSchoolRecords);
}
main();
