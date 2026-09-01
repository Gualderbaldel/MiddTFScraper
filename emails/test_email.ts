import { sendEmail } from "./send_email";

export async function testEmail() {
	const timestamp = new Date().toISOString();
	const body = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body>
        <h1>Middlebury Sprint Report ${timestamp}</h1>
        <p>Weekly Performance Update</p>
        <p>Hello! This is a test.</p>
    </body>
    </html>
    `;
	await sendEmail("Test from my Playwright scraper", body, [
		"fortniteburger170@gmail.com",
	]);
}

testEmail();
