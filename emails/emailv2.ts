import { sendEmail } from "./send_email";
import { format, subWeeks } from "date-fns";
import { scrapeMiddTF } from "../scraper";
async function main() {
    const currentDate = new Date();
    const weekBefore = subWeeks(currentDate, 1);
    const formattedDate = format(currentDate, "MM/dd");
    const formattedWeekBefore = format(weekBefore, "MM/dd");
    const leaderboards = await scrapeMiddTF();
/*
    let body = "<h2>Good evening Middlebury Sprinters</h2><p>Good work this week! Let's look at the top five athletes in the sprint events:</p>";

    for (const [event, athletes] of Object.entries(leaderboards)) {
        body += `<h2>${event}</h2><ul>`;
        for (const { rank, athlete, time } of athletes) {
            body += `<li>${rank}. ${athlete} - ${time}</li>`;
        }
        body += "</ul>";
    }*/

    let body = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #333;">
        <div style="background-color: #37538C; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Middlebury Sprint Report</h1>
            <p style="margin: 8px 0 0;">Weekly Performance Update</p>
        </div>

        <div style="padding: 20px;">
            <h2>Good evening, Middlebury Sprinters!</h2>

            <p>
                Good work this week! Here's a look at the top five
                performances from our sprint events.
            </p>
    `;

    for (const [event, athletes] of Object.entries(leaderboards)) {

        body += `
            <div style="margin-top: 30px;">
                <h2 style="
                    border-bottom: 2px solid #37538C;
                    padding-bottom: 8px;
                    color: #37538C;
                ">
                    ${event}
                </h2>

                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                ">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; text-align: left;">Rank</th>
                        <th style="padding: 10px; text-align: left;">Athlete</th>
                        <th style="padding: 10px; text-align: right;">Time</th>
                    </tr>
        `;

        for (const { rank, athlete, time } of athletes) {
            body += `
                    <tr>
                        <td style="
                            padding: 10px;
                            border-bottom: 1px solid #ddd;
                        ">
                            ${rank}
                        </td>

                        <td style="
                            padding: 10px;
                            border-bottom: 1px solid #ddd;
                        ">
                            ${athlete}
                        </td>

                        <td style="
                            padding: 10px;
                            border-bottom: 1px solid #ddd;
                            text-align: right;
                            font-weight: bold;
                        ">
                            ${time}
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
                Keep working and let's keep moving up the rankings!
            </p>

            <p>
                — Middlebury Sprint Group
            </p>
        </div>

    </div>
    `;

    await sendEmail(
        "Midd Sprints Weekly Report: " + formattedWeekBefore + "-" + formattedDate,
        body,
        ["sebastianpantzer@gmail.com", "spantzer@middlebury.edu"]
    );
}

main();