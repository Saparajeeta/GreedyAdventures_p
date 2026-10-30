import Image from "next/image";
import { MessageSquare, ArrowDown, ShieldCheck, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section
      aria-label="Experience Hero"
      className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-brand-dark text-white"
    >
      {/* Background full-bleed image with editorial overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.greedyadventures.com/greedy/img/home/home-hero-skydivers.webp"
          alt="Skydivers in freefall high above the coastline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 mix-blend-luminosity scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-teal via-brand-teal/80 to-brand-dark/90" />
      </div>

      {/* Top Tag & Main Headline */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-12 w-full">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-brand-amber backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dropzone Thailand * USPA-Certified Instructors</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Sea View Skydiving: <br />
            <span className="text-brand-sand font-normal italic">
              Tandem jump over Pattaya
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Experience the ultimate coastal tandem jump over the Gulf of Thailand.
            Exit high above the coastline, plunge into a thrilling 60-second freefall,
            and enjoy panoramic coastal canopy flight before touching down safely.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#packages"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-amber px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-dark shadow-lg transition duration-200 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span>Choose package</span>
              <ArrowDown className="ml-2 w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href="#chat-assistant"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageSquare className="mr-2 w-4 h-4 text-brand-amber" aria-hidden="true" />
              <span>Ask our assistant</span>
            </a>

            <a
              href="https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition py-2 px-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
                <Play className="w-3 h-3 fill-current ml-0.5" aria-hidden="true" />
              </span>
              <span>Watch jump video (1 min)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Key Stats Bar */}
      <div className="relative z-10 border-t border-white/15 bg-brand-teal/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 text-center sm:text-left">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider text-slate-400">Exit Altitude</dt>
              <dd className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                13,000 <span className="text-sm font-sans font-normal text-brand-amber">ft</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider text-slate-400">Freefall Speed</dt>
              <dd className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ~60 <span className="text-sm font-sans font-normal text-brand-amber">sec</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider text-slate-400">Canopy Flight</dt>
              <dd className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                5–7 <span className="text-sm font-sans font-normal text-brand-amber">min</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider text-slate-400">Time At Dropzone</dt>
              <dd className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ~3 <span className="text-sm font-sans font-normal text-brand-amber">hours</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
