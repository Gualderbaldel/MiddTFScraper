import type { Page } from "@playwright/test";
import { MiddPage } from "./MiddPage";

export class TopPerformancesPage {
    private page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        const middPage = new MiddPage(this.page); 
        await middPage.topPerformances();
        await this.page.waitForTimeout(1000); // Wait for 5 seconds to observe the navigation
       // await this.page.waitForLoadState("networkidle");
    }

async getTopFiveForEvent(event: string) {
    const table = this.page
        .locator(".row.gender_m")
        .filter({
            has: this.page.locator("h3", { hasText: event })
        }).first();

    const rows = table.locator(".performance-list-row");

    const fiveRows = [];

    for (let i = 0; i < 5; i++) {
        if (i >= await rows.count()) {
            break; // Break if there are fewer than 5 rows
        }
        const row = rows.nth(i);
        const athlete = (await row
            .locator(".col-athlete")
            .textContent())?.trim();

        const time = (await row
            .locator(".col-narrow").nth(1)
            .textContent())?.trim();

        fiveRows.push({
            rank: i + 1,
            athlete,
            time
        });
    }

    return fiveRows;
}
async getRanksForEvent(event: string) {
    const table = this.page
        .locator(".row.gender_m")
        .filter({
            has: this.page.locator("h3", { hasText: event })
        }).first();

    const rows = table.locator(".performance-list-row");

    const allRows = await rows.evaluateAll((rows) => {
            return rows
                .map(row => {

                    return {
                        athlete:
                            row.querySelector(".col-athlete")?.textContent?.trim(),
                        time:
                            row.querySelectorAll(".col-narrow")[1]
                                ?.textContent?.trim(),
                        date:
                            row.querySelectorAll(".col-narrow")[2]
                                ?.textContent?.trim(),
                    };
                })
                .filter(row => row !== null);
        });

    return allRows;
}
}