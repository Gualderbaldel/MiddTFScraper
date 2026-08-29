import type { Page } from "@playwright/test";

export class AthletePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(url: string) {
        await this.page.goto(url);
    }

    getMeetResults() {
        return this.page.locator('table.table-hover')
    }

    getPRs() {
    return this.page
        .locator("#meet-results tr.highlight");
}

}