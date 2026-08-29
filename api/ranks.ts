import "dotenv/config";
import { supabase } from "./supabase";
import type { Leaderboard, LeaderboardEntry } from "../types"

export async function athleteRankings(ranks: Leaderboard, outdoor: boolean): Promise<Leaderboard> {
    const season = outdoor ? "outdoor" : "indoor"
    const updatedRanks: Leaderboard = {}
    for (const [event, rows] of Object.entries(ranks)) {
        const athletes = rows.map(row => row.athlete);
        const { data: data, error: fetchError } = await supabase
            .from(`${season}_rankings`)
            .select("*")
            .in("name", athletes)
            .eq("event", event);
        if (fetchError) {
            console.error(
                `Error checking rows:`,
                fetchError.message
            );
            continue;
        }
        let eventData = data;
        const returnedAthletes = new Set(eventData.map(athlete => athlete.name));
        const missingAthletes = rows.filter(athlete => !returnedAthletes.has(athlete.athlete));
        if (missingAthletes.length > 0) {
            console.log(`These athletes are not in the rankings database for the ${event}: `, missingAthletes.map(athlete => athlete.athlete))
            const rowsToInsert = missingAthletes.map(athlete => ({
                name: athlete.athlete,
                event: event,
                national_rank: athlete.nationalRank,
                former_national_rank: athlete.nationalRank,
                ne_rank: athlete.NERank,
                former_ne_rank: athlete.NERank,
                nescac_rank: athlete.nescacRank,
                former_nescac_rank: athlete.nescacRank,
            }));

            const { data: insertedData, error } = await supabase
                .from(`${season}_rankings`)
                .insert(rowsToInsert)
                .select();
            if (error) {
                console.error("Error inserting rankings:", error);
            } else console.log("athletes added to rankings: ", missingAthletes.map(athlete => athlete.athlete))
            eventData = [...eventData, ...(insertedData ?? [])]
        }
            const athletesByName = new Map(rows.map(athlete => [athlete.athlete, athlete]));
            const eventRows: LeaderboardEntry[] = [];
            for (const row of eventData) {
                const athlete = athletesByName.get(row.name)
                if (!athlete) {
                    continue
                }
                const updates: Record<string, number | null> = {};

                if ((athlete.nationalRank ?? null) !== row.national_rank) {
                    updates.former_national_rank = row.national_rank;
                    updates.national_rank = athlete.nationalRank ?? null;
                    console.log(`updating national rank for ${athlete.athlete} from ${row.national_rank} to ${athlete.nationalRank}`)
                }

                if ((athlete.NERank ?? null) !== row.ne_rank) {
                    updates.former_ne_rank = row.ne_rank;
                    updates.ne_rank = athlete.NERank ?? null;
                    console.log(`updating nescac rank for ${athlete.athlete} from ${row.ne_rank} to ${athlete.NERank}`)
                }

                if ((athlete.nescacRank ?? null) !== row.nescac_rank) {
                    updates.former_nescac_rank = row.nescac_rank;
                    updates.nescac_rank = athlete.nescacRank ?? null;
                    console.log(`updating nescac rank for ${athlete.athlete} from ${row.nescac_rank} to ${athlete.nescacRank}`)
                }

                if (Object.keys(updates).length > 0) {
                    const { data, error } = await supabase
                        .from(`${season}_rankings`)
                        .update(updates)
                        .eq("name", row.name)
                        .eq("event", event)
                        .select();
                    if (error) {
                        console.error(`Error updating ${row.name}:`, error);
                    }
                    const existing = rows.find(
                        row => row.athlete === athlete.athlete
                    );

                    if (!existing) {
                        continue;
                    }
                    const fieldMap: Record<string, string> = {
                        national_rank: "nationalRank",
                        former_national_rank: "formerNationalRank",
                        ne_rank: "NERank",
                        former_ne_rank: "formerNERank",
                        nescac_rank: "nescacRank",
                        former_nescac_rank: "formerNescacRank",
                    };

                    const localUpdates: Record<string, number | null> = {};

                    for (const [key, value] of Object.entries(updates)) {
                        const localKey = fieldMap[key];

                        if (localKey) {
                            localUpdates[localKey] = value;
                        }
                    }
                    if (data?.[0]) {
                        eventRows.push({
                            ...existing,
                            nationalRank: athlete.nationalRank,
                            formerNationalRank: data[0].former_national_rank,

                            NERank: athlete.NERank,
                            formerNERank: data[0].former_ne_rank,

                            nescacRank: athlete.nescacRank,
                            formerNescacRank: data[0].former_nescac_rank,
                        });
                    }
                } else {
                    const existing = rows.find(
                        row => row.athlete === athlete.athlete
                    );

                    if (!existing) {
                        continue;
                    } eventRows.push(existing)
                }
            }
            updatedRanks[event] = eventRows.sort((a, b) => {
                const timeDifference =
                    parseTime(a.time ?? "0") - parseTime(b.time ?? "0");

                if (timeDifference !== 0) {
                    return timeDifference;
                }

                return (a.athlete ?? "").localeCompare(b.athlete ?? "");
            });
        }
    return updatedRanks;
}
function parseTime(time: string): number {
    time = time.replace("#", "").trim();
    if (time.includes(":")) {
        const [minutes, seconds] = time.split(":").map(Number);
        return (minutes * 60 + seconds);
    }

    return Number(time);
}