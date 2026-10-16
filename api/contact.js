
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { name, email, subject, message } =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Please complete all required fields.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (!process.env.RESEND_API_KEY ||
        !process.env.CONTACT_TO_EMAIL) {
      return res.status(500).json({
        success: false,
        error: "Email service is not configured.",
      });
    }

    // Safely escape user input for HTML
    const escapeHTML = (value) =>
      String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]);

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ÉLAN Contact <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `ÉLAN Inquiry: ${subject}`,
          html: `
            <h2>New ÉLAN Contact Inquiry</h2>
            <p><strong>Name:</strong> ${escapeHTML(name)}</p>
            <p><strong>Email:</strong> ${escapeHTML(email)}</p>
            <p><strong>Subject:</strong> ${escapeHTML(subject)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap">${escapeHTML(message)}</p>
          `,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(502).json({
        success: false,
        error: "Unable to send your message. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your inquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
}
