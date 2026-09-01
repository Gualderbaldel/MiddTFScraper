import type { Page } from "@playwright/test";

export class DIIIPAGE {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto(outdoor: boolean) {
		if (outdoor)
			this.page.goto(
				"https://tf.tfrrs.org/list_data/5604?other_lists=https%3A%2F%2Ftf.tfrrs.org%2Flists%2F5604%2F2026_NCAA_Division_III_Outdoor_Qualifying_FINAL&limit=500&gender=m",
			);
		else
			this.page.goto(
				"https://tf.tfrrs.org/list_data/5354?other_lists=https%3A%2F%2Ftf.tfrrs.org%2Flists%2F5354%2F2025_2026_NCAA_Division_III_Indoor_List_FINAL&limit=500&event_type=&year=&gender=m",
			);
		await this.page.waitForTimeout(10000);
		// await this.page.waitForLoadState("networkidle");
	}

	async getTopDiiiEvent(event: string) {
		const table = this.page
			.locator(".row.gender_m")
			.filter({
				has: this.page.locator("h3", { hasText: event }),
			})
			.first();

		const rows = table.locator(".performance-list-row");
		const nescacs = [
			"Middlebury",
			"Amherst",
			"Williams",
			"Bowdoin",
			"Bates",
			"Tufts",
			"Connecticut College",
			"Trinity (Conn.)",
			"Wesleyan",
			"Colby",
		];
		const nescacRows = await rows.evaluateAll((rows, nescacs) => {
			return rows
				.map((row) => {
					const team = row.querySelector(".col-team")?.textContent?.trim();
					if (!nescacs.includes(team ?? "")) {
						return null;
					}
					const nationalRank = Number(
						row.querySelector(".col-place")?.textContent?.trim(),
					);
					return {
						nationalRank: nationalRank,
						formerNationalRank: nationalRank,
						athlete: row.querySelector(".col-athlete")?.textContent?.trim(),
						time: row.querySelectorAll(".col-narrow")[1]?.textContent?.trim(),
						team: row.querySelector(".col-team")?.textContent?.trim(),
						date: row.querySelectorAll(".col-narrow")[2]?.textContent?.trim(),
					};
				})
				.filter((row) => row !== null);
		}, nescacs);
		const middRows = nescacRows.filter(
			(row) => (row.team ?? "") === "Middlebury",
		);
		return { nescacRows, middRows };
	}
}
