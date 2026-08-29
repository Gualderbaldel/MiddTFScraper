import type { Leaderboard, PersonalRecord } from "../types";
import { sendEmail } from "./send_email";
import { format, subWeeks } from "date-fns";
import fs from "fs";
import path from "path";

export async function emailV1(
    leaderboard: Leaderboard,
    prs: [string, PersonalRecord[]][],
    srs: PersonalRecord[][],
) {
    const currentDate = new Date();
    const weekBefore = subWeeks(currentDate, 1);
    const formattedDate = format(currentDate, "MM/dd");
    const formattedWeekBefore = format(weekBefore, "MM/dd");
    /*
        let body = "<h2>Good evening Middlebury Sprinters</h2><p>Good work this week! Let's look at the top five athletes in the sprint events:</p>";
    
        for (const [event, athletes] of Object.entries(leaderboards)) {
            body += `<h2>${event}</h2><ul>`;
            for (const { NERank, athlete, time } of athletes) {
                body += `<li>${NERank}. ${athlete} - ${time}</li>`;
            }
            body += "</ul>";
        }
        */

    let body = `
    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/42/Middlebury_Panthers_logo.svg/500px-Middlebury_Panthers_logo.svg.png" alt="Middlebury Panthers Logo" style="display: block; margin: 0 auto; max-width: 50%; height: 50%;">
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #333;">
        <div style="background-color: #37538C; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Middlebury Sprint Report</h1>
            <p style="margin: 8px 0 0;">Weekly Performance Update</p>
        </div>

        <div style="padding: 20px;">
            <h2>Good evening, Middlebury Sprinters!</h2>
    `;

    if (srs.length > 0) {
        body += `<p>
                congrats to those who set school records this week:
            </p>`

        //const formattedName = name.replace(/^([^,]+),\s*(.+)$/, "$2 $1");
        body += `
    <table style="
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 8px;
    ">
        <tr>
            <td colspan="4" style="
                padding: 0 0 6px 0;
                border-bottom: 2px solid #37538C;
                color: #37538C;
                font-size: 14px;
                font-weight: bold;
            ">
                School Records
            </td>
        </tr>

        <tr style="background-color: #f2f2f2;">
            <th style="width: 25%; padding: 2px 2px; text-align: left; font-size: 12px;">
                Event
            </th>
            <th style="width: 25%; padding: 2px 2px; text-align: left; font-size: 12px;">
                Time
            </th>
            <th style="width: 25%; padding: 2px 2px; text-align: left; font-size: 12px;">
                Name
            </th>
            <th style="width: 25%; padding: 2px 2px; text-align: right; font-size: 12px;">
                Years Since Broken
            </th>
        </tr>
`;
        for (const sr of srs) {
            for (const personalRecord of sr) {
                body += `
            <tr style="background-color: #cea2fd">
                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    font-weight: bold;
                ">
                    ${personalRecord.event}
                </td>

                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    font-weight: bold;
                    color: #37538C;
                ">
                    ${personalRecord.time}
                </td>

                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    color: #37538C;
                ">
                    ${personalRecord.athlete.name}
                </td>

                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    color: #37538C;
                    text-align: right;
                    font-weight: bold;
                ">
                    ${personalRecord.yearsSinceBroken}
                </td>
            </tr>
        `;
            }
        } body += `
    </table>
`;
    }

    if (prs.length > 0) {
        body += `<p>
                congrats to those who PR'ed this week:
            </p>`
        for (const [name, pr] of prs) {

            const formattedName = name.replace(/^([^,]+),\s*(.+)$/, "$2 $1");
            body += `
    <table style="
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 8px;
    ">
        <tr>
            <td colspan="3" style="
                padding: 0 0 6px 0;
                border-bottom: 2px solid #37538C;
                color: #37538C;
                font-size: 14px;
                font-weight: bold;
            ">
                ${formattedName}
            </td>
        </tr>

        <tr style="background-color: #f2f2f2;">
            <th style="width: 25%; padding: 2px 2px; text-align: left; font-size: 12px;">
                Event
            </th>
            <th style="width: 35%; padding: 2px 2px; text-align: left; font-size: 12px;">
                Time
            </th>
            <th style="width: 40%; padding: 2px 2px; text-align: right; font-size: 12px;">
                Improvement
            </th>
        </tr>
`;

            for (const personalRecord of pr) {
                body += `
            <tr style="background-color: #effd5f">
                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    font-weight: bold;
                ">
                    ${personalRecord.event}
                </td>

                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    font-weight: bold;
                    color: #37538C;
                ">
                    ${personalRecord.time}
                </td>

                <td style="
                    padding: 2px 2px;
                    border-bottom: 1px solid #e5e5e5;
                    color: #2e7d32;
                    text-align: right;
                    font-weight: bold;
                ">
                    ↓ ${personalRecord.delta}
                </td>
            </tr>
        `;
            }
            body += `
    </table>
`;
        }
    } else {
        `<p>
                No PR's this week :(
            </p>`}

    body += `<p>
                Good work this week! Here's a look at the top five
                performances from our sprint events.
            </p>`

    for (const [event, athletes] of Object.entries(leaderboard)) {

        body += `
            <div style="margin-top: 10px;">
                <h2 style="
                    margin: 0;
                    border-bottom: 2px solid #37538C;
                    padding-bottom: 4px;
                    color: #37538C;
                ">
                    ${event}
                </h2>

                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 4px;
                ">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 2px; text-align: left;">NE</th>
                        <th style="padding: 2px; text-align: left;">NESCAC</th>
                        <th style="padding: 2px; text-align: left;">DIII</th>
                        <th style="padding: 2px; text-align: left;">Athlete</th>
                        <th style="padding: 2px; text-align: right;">Time</th>
                        <th style="padding: 2px; text-align: right;">Date</th>                        
                    </tr>
        `;

        for (const { NERank, formerNERank, nescacRank, formerNescacRank, nationalRank, formerNationalRank, athlete, time, date } of athletes) {
            body += `
                    <tr>
                        <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                        ">
                            ${formatRank(NERank, formerNERank)}
                        </td>
                        <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                            text-align: left;
                        ">
                            ${formatRank(nescacRank, formerNescacRank)}
                        </td>
                        <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                            text-align: left;
                        ">
                            ${formatRank(nationalRank, formerNationalRank)}
                        </td>

                        <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                        ">
                            ${athlete}
                        </td>

                        <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                            text-align: right;
                            font-weight: bold;
                        ">
                            ${time}
                        </td>
                                                <td style="
                            padding: 2px;
                            border-bottom: 1px solid #ddd;
                            text-align: right;
                        ">
                            ${date}
                        </td>
                    </tr>
            `;
        }

        body += `
                </table>
            </div>
        `;
    }

    body += `
            <p style="margin-top: 35px;">
                Keep working and let's keep moving up the Rankings!
            </p>

            <p>
                — Middlebury Sprint Group
            </p>
        </div>

    </div>
    `;


    const previewPath = path.join(process.cwd(), "preview.html");

    fs.writeFileSync(
        previewPath,
        `
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>PR Updates</title>
    </head>
    <body style="
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
        max-width: 700px;
        margin: 0 auto;
    ">
        ${body}
    </body>
    </html>
    `
    );/*
    await sendEmail(
        "Midd Sprints Weekly Report: " + formattedWeekBefore + "-" + formattedDate,
        body,
        ["slide4von1997@gmail.com", "spantzer@middlebury.edu", "ryanpthompson2005@gmail.com", "ethanagnew31@gmail.com"]
    );*/
}
function formatRank(
    current: number | undefined,
    former: number | undefined
): string {
    if (current === undefined || current === null) {
        return "";
    }

    // No previous rank
    if (former === undefined || former === null) {
        return `<span>${current}</span>`;
    }

    let color: string;
    let symbol: string;

    let delta: number | string = Math.abs(former - current)

    if (current < former) {
        color = "green";
        symbol = "↑";
    } else if (current > former) {
        color = "red";
        symbol = "↓";
    } else {
        color = "gray";
        symbol = "-";
        delta = "";
    }

    return `
        <span>${current}</span>
        <small style="
            font-size: 10px;
            font-weight: bold;
            color: ${color};
            margin-left: 4px;
            white-space: nowrap;
        ">
            ${symbol}${delta}
        </small>
    `;
}