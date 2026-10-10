import { NextResponse } from "next/server"

const STATION_EMAIL = "frontdesk@radio7441fm.co.za"

type Enquiry = {
  name: string
  email: string
  message: string
  service?: string
  phone?: string
  interest?: string
  experience?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<Enquiry> | null

  if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.message !== "string") {
    return NextResponse.json({ error: "Please provide a name, email and message." }, { status: 400 })
  }
  if (body.name.trim().length < 2 || body.message.trim().length < 5 || !body.email.includes("@")) {
    return NextResponse.json({ error: "Please check your enquiry details." }, { status: 400 })
  }

  const enquiry: Enquiry = {
    name: body.name.trim(),
    email: body.email.trim(),
    message: body.message.trim(),
    service: typeof body.service === "string" ? body.service : "General enquiry",
    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
    interest: typeof body.interest === "string" ? body.interest : undefined,
    experience: typeof body.experience === "string" ? body.experience : undefined,
  }

  const apiKey = process.env.RESEND_API_KEY
  // Without a configured delivery provider we cannot honestly confirm delivery.
  if (!apiKey) {
    console.info("[radio7441] enquiry received (no mail provider configured)", {
      service: enquiry.service, name: enquiry.name, email: enquiry.email,
    })
    return NextResponse.json(
      { error: "Enquiry delivery is not yet configured. Please contact the station directly." },
      { status: 503 },
    )
  }

  const lines = [
    `Service: ${enquiry.service}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : null,
    enquiry.interest ? `Area of interest: ${enquiry.interest}` : null,
    enquiry.experience ? `Experience: ${enquiry.experience}` : null,
    "",
    enquiry.message,
  ].filter(Boolean) as string[]

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM_EMAIL || "Radio 7441 FM <onboarding@resend.dev>",
        to: [STATION_EMAIL],
        reply_to: enquiry.email,
        subject: `New ${enquiry.service} enquiry — Radio 7441 FM`,
        html: `<pre style="font-family:inherit">${escapeHtml(lines.join("\n"))}</pre>`,
      }),
    })

    if (!res.ok) {
      console.error("[radio7441] enquiry delivery failed", await res.text().catch(() => ""))
      return NextResponse.json({ error: "We couldn't send your enquiry. Please try again later." }, { status: 502 })
    }

    return NextResponse.json({ accepted: true })
  } catch (err) {
    console.error("[radio7441] enquiry delivery error", err)
    return NextResponse.json({ error: "We couldn't send your enquiry. Please try again later." }, { status: 502 })
  }
}
