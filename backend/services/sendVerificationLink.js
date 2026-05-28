import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
export default async function sendVerificationLink(receiverEmail, id) {
  const backendURL = process.env.BACKEND_URL;

  const msg = {
    to: receiverEmail,
    from: process.env.SENDER_EMAIL,
    subject: "CodeCollab | Email verification",
    html: `
      <h1 style="font-family:Segoe UI; color:#512FA2">CodeCollab | Email Verification</h1>
<p style="font-family:Segoe UI">Click on the link below to verify your email</p>
<p style="font-family:Segoe UI; font-weight:bold; font-size:0.85rem">(The link is valid for 10 minutes)</p>
<button style="border-radius:0.5rem; border:2px solid black; padding:5px; background-color:#512FA2">
<a href="${backendURL}/auth/verification/${id}" target="_blank" style="text-decoration:none; color:white; font-family:Segoe UI; font-weight:bold">Verify Email</a>
</button>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error(
      "Failed to send email",
      err.response ? err.response.body : err
    );
  }
}
