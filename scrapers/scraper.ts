import type { Page } from "@playwright/test";
import { DIIIPAGE } from "../page_objects/diiiPage";
import { HamiltonPage } from "../page_objects/IDONTLIKEHAMILTONPage";
import { MiddPage } from "../page_objects/MiddPage";
import { NewEnglandPage } from "../page_objects/NewEnglandPage";
import { TopPerformancesPage } from "../page_objects/TopPerformancesPage";
import type { Leaderboard } from "../types/types";

export async function scrapeMiddTF(page: Page, outdoor: boolean) {
	const homePage = new MiddPage(page);
	const topPerformancesPage = new TopPerformancesPage(page);
	const newEnglandPage = new NewEnglandPage(page);
	const hamiltonPage = new HamiltonPage(page);
	const diiiPage = new DIIIPAGE(page);

	await homePage.goto(outdoor);
	if (outdoor) {
		await topPerformancesPage.goto();

		const [topFive100, topFive200, topFive400, topFive400h, topFive110h] =
			await Promise.all([
				topPerformancesPage.getTopFiveForEvent("100 M"),
				topPerformancesPage.getTopFiveForEvent("200 M"),
				topPerformancesPage.getTopFiveForEvent("400 M"),
				topPerformancesPage.getTopFiveForEvent("400 H"),
				topPerformancesPage.getTopFiveForEvent("110 H"),
			]);

		const _leaderboards: Leaderboard = {
			"100": topFive100,
			"200": topFive200,
			"400": topFive400,
			"400h": topFive400h,
			"110h": topFive110h,
		};
		await newEnglandPage.goto(true);
		const [nescac100, nescac200, nescac400, nescac400h, nescac110h] =
			await Promise.all([
				newEnglandPage.getTopNESCACEvent("100 M"),
				newEnglandPage.getTopNESCACEvent("200 M"),
				newEnglandPage.getTopNESCACEvent("400 M"),
				newEnglandPage.getTopNESCACEvent("400 H"),
				newEnglandPage.getTopNESCACEvent("110 H"),
			]);
		const confLeaderboard: Leaderboard = {
			"100": nescac100.nescacRows,
			"200": nescac200.nescacRows,
			"400": nescac400.nescacRows,
			"400h": nescac400h.nescacRows,
			"110h": nescac110h.nescacRows,
		};
		await hamiltonPage.goto(outdoor);
		await topPerformancesPage.goto();
		const [ham100, ham200, ham400, ham400h, ham110h] = await Promise.all([
			topPerformancesPage.getRanksForEvent("100 M"),
			topPerformancesPage.getRanksForEvent("200 M"),
			topPerformancesPage.getRanksForEvent("400 M"),
			topPerformancesPage.getRanksForEvent("400 H"),
			topPerformancesPage.getRanksForEvent("110 H"),
		]);
		const hamLeaderboards: Leaderboard = {
			"100": ham100,
			"200": ham200,
			"400": ham400,
			"400h": ham400h,
			"110h": ham110h,
		};
		await diiiPage.goto(outdoor);

		const [topDiii100, topDiii200, topDiii400, topDiii400h, topDiii110h] =
			await Promise.all([
				diiiPage.getTopDiiiEvent("100 M"),
				diiiPage.getTopDiiiEvent("200 M"),
				diiiPage.getTopDiiiEvent("400 M"),
				diiiPage.getTopDiiiEvent("400 H"),
				diiiPage.getTopDiiiEvent("110 H"),
			]);

		const diiiLeaderboards: Leaderboard = {
			"100": topDiii100.middRows,
			"200": topDiii200.middRows,
			"400": topDiii400.middRows,
			"400h": topDiii400h.middRows,
			"110h": topDiii110h.middRows,
		};
		const merged: Leaderboard = {};
		for (const event of Object.keys(confLeaderboard)) {
			const nescacEntries = confLeaderboard[event] ?? [];
			const newEntries =
				hamLeaderboards[event].map((performance) => ({
					...performance,
					team: "Hamilton",
					NERank: 0,
				})) ?? [];
			let nescacRank = 0;
			const nationalRanks = new Map(
				(diiiLeaderboards[event] ?? []).map((row) => [
					row.athlete,
					row.nationalRank,
				]),
			);
			merged[event] = [...nescacEntries, ...newEntries]
				.sort(
					(a, b) =>
						Number(parseTime(a.time ?? "0")) - Number(parseTime(b.time ?? "0")),
				)
				.map((row, index, rows) => {
					if (
						index === 0 ||
						parseTime(rows[index - 1].time ?? "0") !==
							parseTime(row.time ?? "0")
					)
						nescacRank = index + 1;
					return {
						nationalRank: nationalRanks.get(row.athlete),
						formerNationalRank: nationalRanks.get(row.athlete),
						nescacRank: nescacRank,
						formerNescacRank: nescacRank,
						...row,
					};
				})
				.filter((row) => (row.team ?? "") === "Middlebury");
		}
		await homePage.goto(outdoor);
		return merged;
	} else {
		await topPerformancesPage.goto();
		const [topFive60, topFive200, topFive400, topFive600, topFive60h] =
			await Promise.all([
				topPerformancesPage.getTopFiveForEvent("60 M"),
				topPerformancesPage.getTopFiveForEvent("200 M"),
				topPerformancesPage.getTopFiveForEvent("400 M"),
				topPerformancesPage.getTopFiveForEvent("600 M"),
				topPerformancesPage.getTopFiveForEvent("60 H"),
			]);

		const _leaderboards: Leaderboard = {
			"60": topFive60,
			"200": topFive200,
			"400": topFive400,
			"600": topFive600,
			"60h": topFive60h,
		};
		await newEnglandPage.goto(false);
		const [nescac60, nescac200, nescac400, nescac600, nescac60h] =
			await Promise.all([
				newEnglandPage.getTopNESCACEvent("60 M"),
				newEnglandPage.getTopNESCACEvent("200 M"),
				newEnglandPage.getTopNESCACEvent("400 M"),
				newEnglandPage.getTopNESCACEvent("600 M"),
				newEnglandPage.getTopNESCACEvent("60 H"),
			]);
		const confLeaderboard: Leaderboard = {
			"60": nescac60.nescacRows,
			"200": nescac200.nescacRows,
			"400": nescac400.nescacRows,
			"600": nescac600.nescacRows,
			"60h": nescac60h.nescacRows,
		};
		await hamiltonPage.goto(outdoor);
		await topPerformancesPage.goto();
		const [ham60, ham200, ham400, ham600, ham60h] = await Promise.all([
			topPerformancesPage.getRanksForEvent("60 M"),
			topPerformancesPage.getRanksForEvent("200 M"),
			topPerformancesPage.getRanksForEvent("400 M"),
			topPerformancesPage.getRanksForEvent("600 M"),
			topPerformancesPage.getRanksForEvent("60 H"),
		]);
		const hamLeaderboards: Leaderboard = {
			"60": ham60,
			"200": ham200,
			"400": ham400,
			"600": ham600,
			"60h": ham60h,
		};
		await diiiPage.goto(outdoor);
		const [topDiii60, topDiii200, topDiii400, topDiii600, topDiii60h] =
			await Promise.all([
				diiiPage.getTopDiiiEvent("60 M"),
				diiiPage.getTopDiiiEvent("200 M"),
				diiiPage.getTopDiiiEvent("400 M"),
				diiiPage.getTopDiiiEvent("600 M"),
				diiiPage.getTopDiiiEvent("60 H"),
			]);

		const diiiLeaderboards: Leaderboard = {
			"60": topDiii60.middRows,
			"200": topDiii200.middRows,
			"400": topDiii400.middRows,
			"600": topDiii600.middRows,
			"60h": topDiii60h.middRows,
		};
		console.log(diiiLeaderboards["60"]);
		const merged: Leaderboard = {};
		for (const event of Object.keys(confLeaderboard)) {
			const nescacEntries = confLeaderboard[event] ?? [];
			const newEntries =
				hamLeaderboards[event].map((performance) => ({
					...performance,
					team: "Hamilton",
					NERank: 0,
				})) ?? [];

			let nescacRank = 0;
			const nationalRanks = new Map(
				(diiiLeaderboards[event] ?? []).map((row) => [
					row.athlete,
					row.nationalRank,
				]),
			);
			merged[event] = [...nescacEntries, ...newEntries]
				.sort((a, b) => parseTime(a.time ?? "0") - parseTime(b.time ?? "0"))
				.map((row, index, rows) => {
					if (
						index === 0 ||
						parseTime(rows[index - 1].time ?? "0") !==
							parseTime(row.time ?? "0")
					)
						nescacRank = index + 1;
					return {
						nationalRank: nationalRanks.get(row.athlete),
						formerNationalRank: nationalRanks.get(row.athlete),
						nescacRank: nescacRank,
						formerNescacRank: nescacRank,

						...row,
					};
				})
				.filter((row) => (row.team ?? "") === "Middlebury");
		}
		await homePage.goto(outdoor);
		return merged;
	}
}

function parseTime(time: string): number {
	time = time.replace("#", "").trim();
	if (time.includes(":")) {
		const [minutes, seconds] = time.split(":").map(Number);
		return minutes * 60 + seconds;
	}

	return Number(time);
}
