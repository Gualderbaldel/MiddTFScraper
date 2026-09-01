import type { Page } from "@playwright/test";

export class NewEnglandPage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto(outdoor: boolean) {
		if (outdoor)
			this.page.goto(
				"https://www.tfrrs.org/list_data/5721?other_lists=https%3A%2F%2Fwww.tfrrs.org%2Flists%2F5721%2FDIII_New_England_Outdoor_Performance_List&limit=500&event_type=&year=&gender=m",
			);
		else
			this.page.goto(
				"https://www.tfrrs.org/list_data/5487?other_lists=https%3A%2F%2Fwww.tfrrs.org%2Flists%2F5487%2FDIII_New_England_Outdoor_Performance_List&limit=500&event_type=&year=&gender=m",
			);
		await this.page.waitForTimeout(5000);
		// await this.page.waitForLoadState("networkidle");
	}

	async getTopNESCACEvent(event: string) {
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
					const NERank = Number(
						row.querySelector(".col-place")?.textContent?.trim(),
					);
					return {
						NERank: NERank,
						formerNERank: NERank,
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
