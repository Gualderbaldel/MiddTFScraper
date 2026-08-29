import type {  Page,  } from "@playwright/test";
import "dotenv/config";
import { supabase } from "./supabase";


export async function athleteLinks(page: Page): Promise<{
    name: string;
    url: string;
    id: string;
}[]> {

    const names = ["Agnew, Ethan", "Albright, Finn", "Bobowick, Hayden", "Caspar, Joseph",
         "Gardner, Nathaniel", "Harvey Jr, Donnell", "Hoiland, Sebastian", "Kington, Emerson",
          "Lawton, Wyatt", "Loupessis, Parker", "Pantzer, Sebastian", "Smith, Caleb",
           "Thompson, Ryan", "Vigneaux, Andrew", "Weihs, Cole"];
    const nameRegex = new RegExp(
    names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
    );
    const athleteLinks = await page.locator('a[href*="/athletes/"]').filter({ hasText: nameRegex }).evaluateAll(
        links => links.map(link => {
            const url = (link as HTMLAnchorElement).href;
            const match = url.match(/\/athletes\/(\d+)\//);
            return{
            name: link.textContent?.trim() ?? "",
            url: (link as HTMLAnchorElement).href,
            id: match ? match[1] : "",
        }})
    );
    const uniqueAthleteLinks = [... new Map(athleteLinks.map(athlete => [athlete.id, athlete])).values()];
    //console.log(uniqueAthleteLinks)

    for (const athlete of uniqueAthleteLinks) {
        const {data: existingAthlete, error: fetchError } = await supabase
        .from("athlete_pages")
        .select("*")
        .eq("id", athlete.id)
        .maybeSingle();

        if (fetchError) {
            console.error(
                `Error checking ${athlete.name}:`,
                fetchError.message
            );
            continue;
        }
        if(!existingAthlete) {
            const { error: insertError } = await supabase
            .from("athlete_pages")
            .insert({
                name: athlete.name,
                id: athlete.id,
                url: athlete.url,
            });
            if(insertError) {
                console.error(
                    `Error inserting ${athlete.name}:`,
                    insertError.message
                );
            }else {
                console.log(`Inserted ${athlete.name} into the database.`);
            }
        } else {
            console.log(`Athlete ${athlete.name} already exists in the database.`);
        }
    }
    return uniqueAthleteLinks;
}

