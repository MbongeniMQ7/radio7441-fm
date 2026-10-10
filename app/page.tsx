"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown, ChevronRight, ExternalLink, Heart, Loader2, Mail, MapPin, Menu, Mic2,
  Music2, Pause, Phone, Play, Radio, Send, Signal, Users, Volume2, VolumeX, Wifi, X,
} from "lucide-react"

/* ─────────────────────────── Station data ─────────────────────────── */

const STATION = {
  email: "frontdesk@radio7441fm.co.za",
  phone: "+27 22 022 0000",
  phoneHref: "tel:+27220220000",
  whatsapp: "+27 60 744 1741",
  whatsappHref: "https://wa.me/27607441741",
  location: "Malmesbury, Western Cape, South Africa",
}

type Show = { name: string; start: string; end: string; description: string }

// Confirmed from the client's programme artwork (Tue, Wed, Fri, Sat).
// Unconfirmed days remain empty and must show "Schedule coming soon".
const weeklySchedule: Record<string, Show[]> = {
  Monday: [],
  Tuesday: [
    { name: "Vukanathi Breakfast Show", start: "07:00", end: "10:00", description: "Wake up with great music, news, community updates and inspiring conversations." },
    { name: "Masakhane Sikhulisane", start: "10:00", end: "12:00", description: "Building and empowering our community through education, discussion and development." },
    { name: "Midday Chill", start: "12:00", end: "15:00", description: "Relax and enjoy the best mix of music to brighten your afternoon." },
    { name: "Kumnand' Ses'goduka", start: "15:00", end: "18:00", description: "Your drive-home companion with entertainment, traffic updates and good vibes." },
    { name: "Izwi Labahlali", start: "18:00", end: "19:30", description: "The community's voice. Discussions, local issues and listener participation." },
  ],
  Wednesday: [
    { name: "Sikuvanazo", start: "05:00", end: "07:00", description: "Start your day with motivation, inspiration and great music." },
    { name: "Vukanathi Breakfast Show", start: "07:00", end: "10:00", description: "News, entertainment, community updates and the best morning vibes." },
    { name: "Masakhane Sikhulisane", start: "10:00", end: "12:00", description: "Building stronger communities through discussion and empowerment." },
    { name: "Midday Chill", start: "12:00", end: "15:00", description: "Relax and enjoy your favourite music mix." },
    { name: "Kumnand' Ses'goduka", start: "15:00", end: "18:00", description: "Keeping you company on your journey home with music and talk." },
    { name: "Business Hub", start: "18:00", end: "19:30", description: "Insights, opportunities, entrepreneurship and local business discussions." },
  ],
  Thursday: [],
  Friday: [
    { name: "Sivuka Nazo", start: "05:00", end: "07:00", description: "Start your day with motivation, inspiration and great music." },
    { name: "Vukanathi", start: "07:00", end: "10:00", description: "News, entertainment and community updates on the best morning vibes." },
    { name: "Masakhane Sikhulisane", start: "10:00", end: "12:00", description: "Together we grow stronger communities through discussion and empowerment." },
    { name: "Midday Chill", start: "12:00", end: "15:00", description: "Relax and enjoy your favourite music mix." },
    { name: "Kumnand' Segoduka", start: "15:00", end: "18:00", description: "Keeping you company on your journey home with music and talk." },
    { name: "Ultimate Show", start: "18:00", end: "19:00", description: "Big conversations, top entertainment and what's trending." },
    { name: "Local Talents & DJ Sets", start: "19:00", end: "21:00", description: "Showcasing homegrown talent and the best DJ sets." },
    { name: "Ezamagrootman (Ezayizolo)", start: "21:00", end: "23:00", description: "Classic sounds and timeless hits (Ezayizolo)." },
  ],
  Saturday: [
    { name: "Saturday Exclusive Breakfast Show", start: "07:00", end: "10:00", description: "Featuring special guests, community discussions and great music." },
    { name: "Ezabantwana", start: "10:00", end: "11:00", description: "A fun and educational programme for children and families." },
    { name: "Radio 7441 FM Top 30", start: "11:00", end: "13:00", description: "Counting down the hottest tracks on the charts." },
    { name: "Ubuhle be-Afrika Talk Show", start: "13:00", end: "15:00", description: "Engaging conversations on culture, community and current affairs." },
    { name: "Local Old School Mix", start: "15:00", end: "16:00", description: "Classic local hits and timeless favourites." },
    { name: "Maskandi Music", start: "16:00", end: "18:00", description: "The best traditional and contemporary Maskandi sounds." },
    { name: "Reggae Music Hour", start: "18:00", end: "19:00", description: "Relax and unwind with authentic reggae vibes." },
    { name: "Saturday Zikhipha Ma-What What", start: "19:00", end: "21:00", description: "Your Saturday night entertainment and music experience." },
    { name: "Talk to a Man, Talk to Your Man (Live)", start: "21:00", end: "23:00", description: "Open and honest discussions on relationships, life and personal growth." },
  ],
  Sunday: [],
}
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const faqs: [string, string][] = [
  ["How can I listen to Radio 7441 FM online?", "Use the Listen Live button at the top of the page. Playback requires a configured station stream."],
  ["Where is Radio 7441 FM based?", "Radio 7441 FM is based in Malmesbury, Swartland Municipality, serving the West Coast District of the Western Cape."],
  ["What languages does the station broadcast in?", "The station's published programming commitment is approximately 80% isiXhosa and 20% English."],
  ["How can I advertise on the station?", "Choose an advertising opportunity below and send an enquiry, or email frontdesk@radio7441fm.co.za."],
  ["How can I volunteer or become a presenter?", "Complete the volunteer interest form in the Get Involved section, or contact the station directly."],
  ["How do I enquire about the Wi-Fi Hotspot service?", "Use the Wi-Fi Hotspot enquiry form or WhatsApp 060 744 1741 to enquire about availability."],
]

/* ─────────────────────────── Timezone helpers ─────────────────────────── */

// Returns the current day name and minutes-since-midnight in Africa/Johannesburg.
function nowInJohannesburg() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date())
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const hour = Number(map.hour === "24" ? "00" : map.hour)
  const minute = Number(map.minute)
  return { day: map.weekday, minutes: hour * 60 + minute }
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/* ─────────────────────────── Shared UI ─────────────────────────── */

function SectionLabel({ children }: { children: string }) {
  return <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#123A70]">{children}</p>
}

function Logo() {
  return (
    <a href="#home" aria-label="Radio 7441 FM home" className="flex items-center gap-2">
      <img src="/radi7441_logo3.png" alt="Radio 7441 FM" className="h-12 w-auto object-contain" />
    </a>
  )
}

/* ─────────────────────────── Live player ─────────────────────────── */

function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const streamUrl = process.env.NEXT_PUBLIC_RADIO_STREAM_URL

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const toggle = async () => {
    const el = audioRef.current
    if (!el || !streamUrl) return
    setError(null)
    if (playing) {
      el.pause()
      return
    }
    setLoading(true)
    try {
      await el.play()
    } catch {
      setError("Unable to start playback. Please try again.")
      setLoading(false)
    }
  }

  const toggleMute = () => {
    const el = audioRef.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
  }

  const statusLabel = !streamUrl
    ? "Stream currently unavailable"
    : error
      ? "Stream error"
      : loading
        ? "Connecting…"
        : playing
          ? "ON AIR"
          : "READY TO LISTEN"

  return (
    <div id="listen-live" className="relative overflow-hidden rounded-[2rem] border border-[#07152F]/10 bg-[#07152F] p-5 text-white shadow-[0_24px_80px_rgba(7,21,47,0.16)] sm:p-8">
      <audio
        ref={audioRef}
        src={streamUrl || undefined}
        preload="none"
        onPlaying={() => { setPlaying(true); setLoading(false) }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onError={() => { setError("Stream is currently unavailable."); setLoading(false); setPlaying(false) }}
      />
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#123A70]/50 blur-3xl" />
      <div className="relative flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#F4BF25] text-[#07152F]"><Mic2 size={24} /></div>
            <div><p className="font-serif text-2xl">Radio 7441 FM</p><p className="text-sm text-white/60">Malmesbury, Western Cape</p></div>
          </div>
          <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${playing ? "border-[#F4BF25]/50 text-[#F4BF25]" : "border-white/15 text-white/55"}`}>
            <span className={`size-2 rounded-full ${playing ? "animate-pulse bg-[#F4BF25]" : "bg-white/35"}`} />{statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            aria-label={playing ? "Pause live stream" : "Play live stream"}
            onClick={toggle}
            disabled={!streamUrl || loading}
            className="grid size-16 shrink-0 place-items-center rounded-full bg-[#F4BF25] text-[#07152F] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
          </button>
          <div className="flex-1">
            <div className="mb-3 flex h-12 items-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className={`w-1 rounded-full bg-[#F4BF25]/70 ${playing ? "animate-pulse" : ""}`} style={{ height: `${18 + ((i * 17) % 30)}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>{error ? error : streamUrl ? "Live community radio" : "Stream URL not configured"}</span>
              <span className="flex items-center gap-1"><Signal size={13} /> {playing ? "Connected" : "Standby"}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <div><p className="text-xs uppercase tracking-wider text-white/45">Now playing</p><p className="mt-1 font-medium">Radio 7441 FM</p></div>
          <div><p className="text-xs uppercase tracking-wider text-white/45">Next up</p><p className="mt-1 font-medium">Local voices & music</p></div>
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="text-white/70 hover:text-[#F4BF25]">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              aria-label="Volume"
              className="w-28 accent-[#F4BF25]"
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={(e) => { const next = Number(e.target.value); setVolume(next); setMuted(next === 0); if (audioRef.current) { audioRef.current.volume = next; audioRef.current.muted = next === 0 } }}
            />
          </div>
        </div>
        {!streamUrl && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">
            The live stream is not yet configured. Once the station&apos;s streaming endpoint is available it will play here automatically.
          </p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────── Schedule ─────────────────────────── */

function ScheduleSection() {
  const [selectedDay, setSelectedDay] = useState("Friday")
  const [live, setLive] = useState<{ day: string; show: Show | null; minutes: number } | null>(null)

  useEffect(() => {
    const update = () => {
      const { day, minutes } = nowInJohannesburg()
      const shows = weeklySchedule[day] || []
      const current = shows.find((s) => minutes >= toMinutes(s.start) && minutes < toMinutes(s.end)) || null
      setLive({ day, show: current, minutes })
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const shows = weeklySchedule[selectedDay] || []
  const isLiveDay = live?.day === selectedDay

  const liveBanner = () => {
    if (!live) return null
    const todayShows = weeklySchedule[live.day] || []
    if (todayShows.length === 0) {
      return <>Schedule for <b>{live.day}</b> coming soon.</>
    }
    if (live.show) {
      return <>On air now ({live.day}): <b>{live.show.name}</b> · {live.show.start}–{live.show.end}</>
    }
    return <>We are currently off the scheduled lineup. Tune in during broadcast hours on {live.day}.</>
  }

  return (
    <section id="programmes" className="border-t border-[#07152F]/10 bg-white px-5 py-24 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <SectionLabel>Programme schedule • Africa/Johannesburg</SectionLabel>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">
            There&apos;s always something<br /><span className="text-[#123A70]">worth tuning into.</span>
          </h2>
          <p className="mt-5 leading-7 text-[#35322F]/65">Discover the voices, music and conversations that shape your day.</p>
          <div className="mt-6 rounded-xl border border-[#F4BF25]/40 bg-[#FFF8DC] px-4 py-3 text-sm text-[#07152F]">{liveBanner()}</div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {dayOrder.map((day) => {
              const confirmed = (weeklySchedule[day] || []).length > 0
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${selectedDay === day ? "border-[#F4BF25] bg-[#FFF8DC] font-semibold text-[#07152F]" : "border-[#07152F]/10 hover:border-[#123A70]/30"}`}
                >
                  <span>{day}</span>
                  {confirmed ? <ChevronRight size={14} /> : <span className="text-[10px] uppercase tracking-wide text-[#35322F]/40">soon</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-[#07152F]/10 bg-[#F8F7F5] p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#123A70]">{selectedDay} • Schedule</p>
              <h3 className="mt-1 font-serif text-3xl text-[#07152F]">{selectedDay}</h3>
            </div>
            <Music2 className="text-[#F4BF25]" />
          </div>
          {shows.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-[#07152F]/15 bg-white px-6 py-16 text-center">
              <Radio className="text-[#123A70]" />
              <p className="mt-4 font-serif text-xl text-[#07152F]">Schedule coming soon</p>
              <p className="mt-2 max-w-xs text-sm text-[#35322F]/60">The {selectedDay} programme lineup has not been confirmed yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {shows.map((s) => {
                const isNow = isLiveDay && live?.show?.name === s.name
                return (
                  <div key={s.name} className={`rounded-2xl border px-4 py-4 transition ${isNow ? "border-[#F4BF25] bg-[#FFF8DC]" : "border-transparent border-t-[#07152F]/10"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#123A70]">{s.start}–{s.end}</span>
                      {isNow && <span className="flex items-center gap-1.5 rounded-full bg-[#07152F] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#F4BF25]"><span className="size-1.5 animate-pulse rounded-full bg-[#F4BF25]" />On air</span>}
                    </div>
                    <p className="mt-1 font-medium text-[#07152F]">{s.name}</p>
                    <p className="mt-1 text-sm text-[#35322F]/60">{s.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <p className="mt-8 text-xs text-[#35322F]/45">Currently airing programmes are calculated in the Africa/Johannesburg timezone. Confirmed lineups are published as the station supplies them; remaining days will follow.</p>
    </section>
  )
}

/* ─────────────────────────── Enquiry form ─────────────────────────── */

function EnquiryForm({ service = "General enquiry", fields = "basic" }: { service?: string; fields?: "basic" | "volunteer" | "contact" }) {
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("busy")
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.accepted) {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again or contact us directly.")
        return
      }
      setStatus("sent")
    } catch {
      setStatus("error")
      setMessage("Could not reach the server. Please try again or contact us directly.")
    }
  }

  if (status === "sent") {
    return (
      <div className="grid place-items-center rounded-3xl border border-[#07152F]/10 bg-white p-8 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-[#FFF8DC] text-[#07152F]"><Send size={20} /></div>
        <p className="mt-4 font-serif text-2xl text-[#07152F]">Thank you</p>
        <p className="mt-2 max-w-sm text-sm text-[#35322F]/65">Your {service.toLowerCase()} enquiry has been received by the station. We&apos;ll be in touch soon.</p>
      </div>
    )
  }

  const input = "rounded-xl border border-[#07152F]/10 bg-[#F8F7F5] px-4 py-3 outline-none focus:border-[#F4BF25]"

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-[#07152F]/10 bg-white p-5 sm:p-7">
      <input name="service" type="hidden" value={service} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="name" placeholder="Full name" className={input} />
        <input required type="email" name="email" placeholder="Email address" className={input} />
      </div>
      {(fields === "volunteer" || fields === "contact") && (
        <input name="phone" placeholder="Phone number" className={input} />
      )}
      {fields === "volunteer" && (
        <>
          <select name="interest" className={input} defaultValue="">
            <option value="" disabled>Area of interest</option>
            <option>Radio Programming and Hosting</option>
            <option>Community Outreach</option>
            <option>Technical Support</option>
            <option>Marketing and Social Media</option>
            <option>Youth Mentorship</option>
          </select>
          <textarea name="experience" placeholder="Relevant experience (optional)" rows={2} className={input} />
        </>
      )}
      <textarea
        required name="message" rows={4} className={input}
        placeholder={fields === "volunteer" ? "Short motivation — why you'd like to get involved" : `Tell us about your ${service.toLowerCase()} enquiry`}
      />
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <button disabled={status === "busy"} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F4BF25] px-5 py-3 text-sm font-semibold text-[#07152F] hover:bg-[#FFD21F] disabled:opacity-60">
        {status === "busy" ? "Sending…" : "Send enquiry"}<Send size={15} />
      </button>
    </form>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

const navLinks: [string, string][] = [
  ["Home", "#home"], ["Listen Live", "#listen-live"], ["Programmes", "#programmes"],
  ["About Us", "#about"], ["Our Services", "#services"], ["Wi-Fi Hotspot", "#wifi"],
  ["Get Involved", "#volunteer"], ["Contact", "#contact"],
]

export default function LandingPage() {
  const [menu, setMenu] = useState(false)
  const [faq, setFaq] = useState<number | null>(null)
  const [service, setService] = useState("Radio Advertising")

  const services = useMemo(() => ([
    { icon: Mic2, title: "Amplifying Local Voices", copy: "We create opportunities for community members, leaders, artists and young people to share their experiences and raise awareness of issues affecting the West Coast.", cta: ["Get Involved", "#volunteer"] as const },
    { icon: Radio, title: "News and Public Information", copy: "Local and municipal affairs, public service announcements, community alerts, national and international news, and education and social development.", cta: ["Explore Programmes", "#programmes"] as const },
    { icon: Music2, title: "Local Music & Culture", copy: "A commitment to local music, isiXhosa and English broadcasting, cultural expression and regional talent.", cta: ["Discover Our Shows", "#programmes"] as const },
    { icon: Users, title: "Youth Development & Training", copy: "Broadcasting exposure, media training, presenter development, audio production, journalism skills and mentorship.", cta: ["Join Our Community", "#volunteer"] as const },
    { icon: Heart, title: "Community Dialogue", copy: "Programming exploring health and wellbeing, youth and education, gender-based violence awareness, entrepreneurship, civic participation and community development.", cta: ["Explore Programmes", "#programmes"] as const },
  ]), [])

  const volunteerCategories: [string, string][] = [
    ["Radio Programming and Hosting", "Assist with shows, content preparation and broadcasting."],
    ["Community Outreach", "Support events, awareness initiatives and public engagement."],
    ["Technical Support", "Assist with audio production, broadcasting equipment and studio operations."],
    ["Marketing and Social Media", "Help strengthen communication and public engagement."],
    ["Youth Mentorship", "Support the development of aspiring broadcasters and young creatives."],
  ]

  return (
    <main id="home" className="min-h-screen overflow-hidden bg-[#F8F7F5] text-[#35322F]">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-[1000px] items-center justify-between rounded-full border border-[#07152F]/10 bg-[#F8F7F5]/90 px-4 py-2 shadow-sm backdrop-blur">
          <Logo />
          <div className="hidden items-center gap-5 text-xs font-medium text-[#35322F]/75 lg:flex">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className="transition hover:text-[#123A70]">{label}</a>
            ))}
          </div>
          <a href="#listen-live" className="hidden items-center gap-2 rounded-full bg-[#F4BF25] px-4 py-2 text-xs font-semibold text-[#07152F] sm:flex">
            <Play size={12} fill="currentColor" /> Listen Live
          </a>
          <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X size={19} /> : <Menu size={19} />}</button>
        </nav>
        {menu && (
          <div className="mx-auto mt-2 grid max-w-[1000px] gap-1 rounded-2xl border border-[#07152F]/10 bg-white p-3 shadow-lg lg:hidden">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-[#F8F7F5]">{label}</a>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-[1060px] border-x border-[#07152F]/10">
        {/* Hero */}
        <section className="px-5 pb-16 pt-36 text-center sm:px-10 sm:pt-48">
          <img src="/radio7441-logo-color.png" alt="Radio 7441 FM station logo" className="mx-auto mb-8 h-40 w-auto object-contain sm:h-52" />
          <span className="mx-auto mb-6 inline-flex rounded-full border border-[#07152F]/15 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#123A70]">
            Community Radio • Malmesbury • Western Cape
          </span>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.03] tracking-[-0.055em] text-[#07152F] sm:text-7xl md:text-8xl">
            Your Community.<br /><span className="text-[#123A70]">Your Voice.</span><br />Our Station.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#35322F]/70 sm:text-lg">
            Broadcasting from Malmesbury to communities across the West Coast District, Radio 7441 FM brings you the music, news, conversations and local voices that matter. Rooted in our community, we inform, inspire and empower through every broadcast.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#listen-live" className="rounded-full bg-[#F4BF25] px-6 py-3 text-sm font-semibold text-[#07152F] shadow-[0_0_0_6px_rgba(244,191,37,0.12)] hover:bg-[#FFD21F]">Listen Live</a>
            <a href="#programmes" className="rounded-full border border-[#07152F]/15 bg-white px-6 py-3 text-sm font-semibold text-[#07152F] hover:border-[#123A70]">Explore Our Programmes</a>
          </div>
          <div className="mx-auto mt-16 max-w-[960px] text-left"><LivePlayer /></div>
        </section>

        {/* Quick links */}
        <section className="grid border-y border-[#07152F]/10 sm:grid-cols-3">
          {([[Music2, "Listen Live", "Your favourite community radio, wherever you are.", "#listen-live"], [Radio, "Discover Our Programmes", "From morning inspiration to local talent and late-night classics.", "#programmes"], [Wifi, "Stay Connected", "Explore our Radio 7441 FM Wi-Fi Hotspot initiative.", "#wifi"]] as const).map(([Icon, title, copy, href]) => (
            <a href={href} key={title} className="group border-b border-[#07152F]/10 p-7 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <Icon size={20} className="text-[#123A70]" />
              <h2 className="mt-8 font-serif text-2xl text-[#07152F]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#35322F]/65">{copy}</p>
              <ExternalLink size={15} className="mt-6 text-[#07152F]/35 transition group-hover:text-[#F4BF25]" />
            </a>
          ))}
        </section>

        {/* About */}
        <section id="about" className="border-t border-[#07152F]/10 px-5 py-24 sm:px-10">
          <div className="text-center">
            <SectionLabel>About Radio 7441 FM</SectionLabel>
            <h2 className="mx-auto max-w-2xl font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">
              More than radio.<br /><span className="text-[#123A70]">A voice for everyone.</span>
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#07152F]/10 bg-white p-7">
              <h3 className="font-serif text-2xl text-[#07152F]">Who we are</h3>
              <p className="mt-4 text-sm leading-7 text-[#35322F]/70">
                Radio 7441 FM is a community broadcasting station based in Malmesbury, serving listeners across the West Coast District of the Western Cape. The station operates as a registered Public Benefit Organisation and focuses on education, cultural representation, entertainment, local information and social development.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#35322F]/70">
                It gives community members, emerging broadcasters, artists and young people opportunities to participate, share experiences and develop their skills — creating an inclusive broadcasting environment that strengthens relationships between communities while celebrating their diversity.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-[#07152F]/10 bg-[#07152F] p-7 text-white">
                <p className="text-xs uppercase tracking-widest text-[#F4BF25]">Our Vision</p>
                <p className="mt-4 font-serif text-xl leading-relaxed">&ldquo;To be a community radio station that sustainably develops, empowers and elevates the communities we serve.&rdquo;</p>
              </div>
              <div className="rounded-3xl border border-[#07152F]/10 bg-white p-7">
                <p className="text-xs uppercase tracking-widest text-[#123A70]">Our Mission</p>
                <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#35322F]/70">
                  {["Deliver culturally diverse information, education and entertainment.", "Provide accurate and impartial news that affects local communities.", "Make broadcasting accessible to the public.", "Support community development and social cohesion.", "Develop emerging broadcasting talent.", "Deliver quality programming and service to listeners.", "Promote local music, languages, heritage and stories."].map((m) => (
                    <li key={m} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F4BF25]" />{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Broadcasting identity */}
          <div className="mx-auto mt-6 max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {[["80%", "isiXhosa programming"], ["20%", "English programming"], ["70%", "Local music content commitment"]].map(([stat, label]) => (
                <div key={label} className="rounded-3xl border border-[#07152F]/10 bg-white p-7 text-center">
                  <p className="font-serif text-5xl text-[#123A70]">{stat}</p>
                  <p className="mt-2 text-sm text-[#35322F]/65">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-[#35322F]/45">These figures represent the station&apos;s published programming commitments, not independently audited performance statistics.</p>
          </div>
        </section>

        {/* Programmes / schedule */}
        <ScheduleSection />

        {/* Services */}
        <section id="services" className="border-t border-[#07152F]/10 px-5 py-24 sm:px-10">
          <SectionLabel>Our Services</SectionLabel>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">Made for connection.<br /><span className="text-[#123A70]">Powered by community.</span></h2>
              <p className="mt-5 max-w-md leading-7 text-[#35322F]/65">Serving the West Coast through broadcasting, information, culture, youth development and community dialogue.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map(({ icon: Icon, title, copy, cta }) => (
                <div key={title} className="flex min-h-48 flex-col rounded-2xl border border-[#07152F]/10 bg-white p-5">
                  <Icon size={19} className="text-[#123A70]" />
                  <h3 className="mt-6 font-serif text-2xl text-[#07152F]">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#35322F]/60">{copy}</p>
                  <a href={cta[1]} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#123A70] hover:text-[#07152F]">{cta[0]}<ChevronRight size={15} /></a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wi-Fi Hotspot */}
        <section id="wifi" className="border-t border-[#07152F]/10 bg-white px-5 py-24 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <SectionLabel>Wi-Fi Hotspot Initiative</SectionLabel>
              <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">Stay Connected with<br /><span className="text-[#123A70]">Radio 7441 FM.</span></h2>
              <p className="mt-5 max-w-md leading-7 text-[#35322F]/65">
                The Radio 7441 FM Wi-Fi Hotspot initiative is part of our commitment to connecting communities beyond the airwaves. Availability, coverage areas and packages are being finalised.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-[#35322F]/70">
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F4BF25]" />Enquire about availability in your area</li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F4BF25]" />Coverage information will be shared once confirmed</li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F4BF25]" />WhatsApp our team for the quickest response</li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={STATION.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#07152F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123A70]"><Phone size={15} /> Enquire About Availability</a>
              </div>
            </div>
            <EnquiryForm service="Wi-Fi Hotspot" fields="contact" />
          </div>
        </section>

        {/* Presenters — neutral empty state (no invented people) */}
        <section className="relative isolate overflow-hidden border-t border-[#07152F]/10 px-5 py-24 sm:px-10">
          <div className="absolute inset-0 -z-10 bg-[#07152F]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(18,58,112,0.7),transparent_50%)]" />
          <div className="relative">
            <SectionLabel>Meet the presenters</SectionLabel>
            <h2 className="max-w-2xl font-serif text-5xl leading-tight tracking-[-0.04em] text-white">
              Meet the voices behind<br /><span className="text-[#F4BF25]">Radio 7441 FM.</span>
            </h2>
            <div className="mt-10 grid place-items-center rounded-3xl border border-white/10 bg-[#07152F]/70 px-6 py-20 text-center backdrop-blur-sm">
              <div className="grid size-14 place-items-center rounded-full bg-[#123A70] text-[#F4BF25]"><Mic2 size={24} /></div>
              <p className="mt-5 font-serif text-3xl text-white">Meet our presenters — profiles coming soon.</p>
              <p className="mt-3 max-w-md text-white/60">We&apos;re preparing verified profiles of the presenters behind your favourite shows. Check back soon.</p>
            </div>
          </div>
        </section>

        {/* Advertising & partnerships */}
        <section id="advertising" className="border-t border-[#07152F]/10 bg-[#F8F7F5] px-5 py-24 sm:px-10">
          <div className="text-center">
            <SectionLabel>Advertising & Partnerships</SectionLabel>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">Your business deserves<br /><span className="text-[#123A70]">to be heard.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-[#35322F]/65">Connect with your community through meaningful advertising and partnership opportunities.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 lg:grid-cols-3">
            {([["Radio Advertising", "Put your business in front of our community through radio advertising opportunities."], ["Sponsored Programmes", "Explore programme sponsorships and branded broadcasting opportunities."], ["Community Partnerships", "Work with Radio 7441 FM on initiatives that connect, inform and empower."]] as const).map(([title, copy], i) => (
              <div key={title} className={`flex flex-col rounded-3xl border p-6 ${i === 1 ? "border-[#07152F] bg-[#07152F] text-white" : "border-[#07152F]/10 bg-white"}`}>
                <p className="text-xs uppercase tracking-widest opacity-60">0{i + 1}</p>
                <h3 className="mt-10 font-serif text-3xl">{title}</h3>
                <p className="mt-3 min-h-20 flex-1 text-sm leading-6 opacity-65">{copy}</p>
                <button onClick={() => { setService(title); document.getElementById("advertising-form")?.scrollIntoView({ behavior: "smooth" }) }} className={`mt-7 w-fit rounded-full px-5 py-3 text-sm font-semibold ${i === 1 ? "bg-[#F4BF25] text-[#07152F]" : "bg-[#07152F] text-white"}`}>Enquire Now</button>
              </div>
            ))}
          </div>
          <div id="advertising-form" className="mx-auto mt-6 max-w-4xl">
            <EnquiryForm service={service} fields="contact" />
          </div>
        </section>

        {/* Volunteer / Get involved */}
        <section id="volunteer" className="border-t border-[#07152F]/10 px-5 py-24 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionLabel>Get Involved</SectionLabel>
              <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">Be Part of the Voice<br /><span className="text-[#123A70]">of Our Community.</span></h2>
              <p className="mt-5 max-w-md leading-7 text-[#35322F]/65">
                Radio 7441 FM welcomes people who want to contribute their time, creativity and skills to community broadcasting and development.
              </p>
              <div className="mt-8 grid gap-3">
                {volunteerCategories.map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-[#07152F]/10 bg-white p-4">
                    <h3 className="font-semibold text-[#07152F]">{title}</h3>
                    <p className="mt-1 text-sm text-[#35322F]/60">{copy}</p>
                  </div>
                ))}
              </div>
              <a href="#volunteer-form" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#F4BF25] px-5 py-3 text-sm font-semibold text-[#07152F] hover:bg-[#FFD21F]">Apply to Volunteer<ChevronRight size={15} /></a>
            </div>
            <div id="volunteer-form">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#123A70]">Volunteer interest form</p>
              <EnquiryForm service="Volunteer" fields="volunteer" />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t border-[#07152F]/10 bg-white px-5 py-24 sm:px-10">
          <div className="text-center">
            <SectionLabel>Contact Us</SectionLabel>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#07152F]">Let&apos;s talk.<br /><span className="text-[#123A70]">We&apos;re listening.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-[#35322F]/65">Reach the Radio 7441 FM team through any of the options below.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              [Phone, "Call Us", STATION.phone, STATION.phoneHref, false],
              [Mail, "Send Email", STATION.email, `mailto:${STATION.email}`, false],
              [Phone, "WhatsApp Us", STATION.whatsapp, STATION.whatsappHref, true],
              [Mic2, "Advertising Enquiry", "Enquire about advertising", "#advertising", false],
              [Users, "Volunteer Enquiry", "Join our community", "#volunteer", false],
              [MapPin, "Location", STATION.location, STATION.whatsappHref, false],
            ] as const).map(([Icon, title, value, href, external]) => (
              <a
                key={title} href={href}
                target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
                className="flex items-start gap-3 rounded-2xl border border-[#07152F]/10 bg-[#F8F7F5] p-5 transition hover:border-[#123A70]/30"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#123A70]"><Icon size={18} /></div>
                <div><p className="text-sm font-semibold text-[#07152F]">{title}</p><p className="mt-1 text-sm text-[#35322F]/60">{value}</p></div>
              </a>
            ))}
          </div>
          <div className="mx-auto mt-6 max-w-4xl"><EnquiryForm service="General enquiry" fields="contact" /></div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#07152F]/10 px-5 py-24 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>Questions</SectionLabel>
            <h2 className="font-serif text-5xl text-[#07152F]">Frequently Asked Questions</h2>
            <div className="mt-10">
              {faqs.map(([q, a], i) => (
                <div key={q} className="border-t border-[#07152F]/10">
                  <button onClick={() => setFaq(faq === i ? null : i)} className="flex w-full items-center justify-between py-5 text-left font-medium text-[#07152F]">
                    {q}<ChevronDown size={17} className={`transition ${faq === i ? "rotate-180" : ""}`} />
                  </button>
                  {faq === i && <p className="pb-5 pr-8 text-sm leading-6 text-[#35322F]/65">{a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-[#07152F]/10 bg-[#07152F] px-5 py-24 text-center text-white sm:px-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent 0, transparent 12px, #F4BF25 12px, #F4BF25 13px)" }} />
          <div className="relative">
            <SectionLabel>Your soundtrack</SectionLabel>
            <h2 className="font-serif text-6xl tracking-[-0.05em]">Your community.<br /><span className="text-[#F4BF25]">Your soundtrack.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-white/65">Good music, great people, and conversations that bring us together. Wherever you are, Radio 7441 FM is here for you.</p>
            <a href="#listen-live" className="mt-8 inline-flex rounded-full bg-[#F4BF25] px-6 py-3 text-sm font-semibold text-[#07152F]">Tune In Live</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="grid gap-10 border-t border-[#07152F]/10 px-5 py-12 sm:grid-cols-[1.5fr_1fr_1fr_1fr] sm:px-10">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#35322F]/60">Your Community. Your Voice. Our Station. Community radio broadcasting from Malmesbury across the West Coast District.</p>
          </div>
          <div>
            <p className="font-semibold text-[#07152F]">Explore</p>
            <a href="#programmes" className="mt-4 block text-sm text-[#35322F]/60">Programmes</a>
            <a href="#listen-live" className="mt-2 block text-sm text-[#35322F]/60">Listen Live</a>
            <a href="#services" className="mt-2 block text-sm text-[#35322F]/60">Our Services</a>
          </div>
          <div>
            <p className="font-semibold text-[#07152F]">Community</p>
            <a href="#wifi" className="mt-4 block text-sm text-[#35322F]/60">Wi-Fi Hotspot</a>
            <a href="#volunteer" className="mt-2 block text-sm text-[#35322F]/60">Get Involved</a>
            <a href="#about" className="mt-2 block text-sm text-[#35322F]/60">About Radio 7441</a>
          </div>
          <div>
            <p className="font-semibold text-[#07152F]">Get in touch</p>
            <a href={STATION.whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm text-[#35322F]/60">WhatsApp: {STATION.whatsapp}</a>
            <a href={STATION.phoneHref} className="mt-2 block text-sm text-[#35322F]/60">Tel: {STATION.phone}</a>
            <a href={`mailto:${STATION.email}`} className="mt-2 block text-sm text-[#123A70]">{STATION.email}</a>
            <p className="mt-2 text-sm text-[#35322F]/60">{STATION.location}</p>
          </div>
          <p className="border-t border-[#07152F]/10 pt-6 text-xs text-[#35322F]/45 sm:col-span-4">© 2026 Radio 7441 FM. A registered Public Benefit Organisation. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
