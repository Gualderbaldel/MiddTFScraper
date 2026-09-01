import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.USER_NAME,
		pass: process.env.USER_PASS,
	},
});

export async function sendEmailNodemailer(
	subject: string,
	body: string,
	recipients: string[],
) {
	const info = await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to: recipients,
		subject,
		html: body,
	});

	console.log("Email sent:", info.accepted);
}
