import type { Page } from "@playwright/test";

export class HamiltonPage {
    private page: Page;


    constructor(page: Page) {
        this.page = page;
    }

    async goto(outdoor: boolean) {
        if (outdoor) {
            await this.page.goto("https://www.tfrrs.org/teams/tf/NY_college_m_Hamilton.html?config_hnd=434");
        } else {
            await this.page.goto("https://www.tfrrs.org/teams/tf/NY_college_m_Hamilton.html?config_hnd=416");
        }
    }

    async getEventData(event: string) {
        const eventLocator = this.page.locator("tr").filter({ hasText: event });
        const times = (await eventLocator.locator("td").nth(3).textContent())?.trim();
        const athlete = (await eventLocator.locator("td").nth(1).textContent())?.trim();
        return { event, times, athlete };
    }
    async topPerformances() {
        await this.page.locator("a").filter({ hasText: "Top Performances" }).click();
    }
}