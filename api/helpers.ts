import "dotenv/config";
import { supabase } from "./supabase";
import type { Athlete, PersonalRecord } from "../types"

export async function fetchAllPersonalRecords(athlete: Athlete) {
    const { data: existingAthlete, error: fetchError } = await supabase
        .from("athlete_prs")
        .select("*")
        .eq("athlete_id", athlete.id)
    return { existingAthlete, fetchError };
}

export async function fetchPersonalRecord(pr: Omit<PersonalRecord, 'delta' | 'athlete'>, athlete: Athlete) {
    const { data: existingAthlete, error: fetchError } = await supabase
        .from("athlete_prs")
        .select("*")
        .eq("athlete_id", athlete.id)
        .eq("event", pr.event)
        .maybeSingle();
    return { existingAthlete, fetchError };
}

export async function insertPersonalRecord(pr: Omit<PersonalRecord, 'delta' | 'athlete'>, athlete: Athlete) {
    const { error: insertError } = await supabase
        .from("athlete_prs")
        .insert({
            name: athlete.name,
            athlete_id: athlete.id,
            time: pr.time,
            event: pr.event,
        });
    return { insertError };
}
export async function updatePersonalRecord(pr: Omit<PersonalRecord, 'delta' | 'athlete'>, athlete: Athlete) {
    await supabase
        .from("athlete_prs")
        .update({ time: `${pr.time}` })
        .eq("name", athlete.name)
        .eq("event", pr.event)
        .maybeSingle();
}
export async function addToPersonalRecordHistory(
    pr: Omit<PersonalRecord, 'delta' | 'athlete'>,
    athlete: Athlete,
    delta: number,
    oldTime: number) {
    const { error } = await supabase
        .from("every_pr")
        .insert({
            name: athlete.name,
            id: athlete.id,
            time: pr.time,
            event: pr.event,
            delta: Number(delta),
            old_time: oldTime,
        });
    return { error };
}

export async function fetchSchoolRecord(event: string, outdoor: boolean) {
    if (outdoor) {
        const { data: schoolRecord, error: fetchError } = await supabase
            .from("outdoor_school_records")
            .select("*")
            .eq("event", event)
            .maybeSingle()
        return { schoolRecord, fetchError };
    }
    const { data: schoolRecord, error: fetchError } = await supabase
        .from("indoor_school_records")
        .select("*")
        .eq("event", event)
        .maybeSingle()
    return { schoolRecord, fetchError };

}

export async function insertSchoolRecord(pr: Omit<PersonalRecord, 'delta' | 'athlete'>, name: string, year: string, outdoor: boolean) {
    if (outdoor) {
        await supabase
            .from("outdoor_school_records")
            .insert({
                event: pr.event,
                time: pr.time,
                year: year,
                name: name,
            })
    } else {
        await supabase
            .from("indoor_school_records")
            .insert({
                event: pr.event,
                time: pr.time,
                year: year,
                name: name,
            })
    }
}

export async function updateSchoolRecord(pr: Omit<PersonalRecord, 'delta' | 'athlete'>, name: string, year: string, outdoor: boolean) {
    if (outdoor) {
        await supabase
            .from("outdoor_school_records")
            .update({
                time: pr.time,
                year: year,
                name: name,
            }
            )
            .eq("event", pr.event)
            .maybeSingle()
    } else {
        await supabase
            .from("indoor_school_records")
            .update({
                time: pr.time,
                year: year,
                name: name,
            }
            )
            .eq("event", pr.event)
            .maybeSingle()
    }
}