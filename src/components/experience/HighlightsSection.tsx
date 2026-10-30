import { MapPin, Bus, CheckCircle2, ShieldAlert, Award, Plane, FileText } from "lucide-react";

export function HighlightsSection() {
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="scroll-mt-16 py-20 px-4 sm:px-6 lg:px-8 bg-brand-sand/60 border-b border-brand-teal/10"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-amber">
            Essential Information
          </p>
          <h2
            id="highlights-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-teal"
          >
            Highlights & Good to know
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Everything that comes with this tandem experience, logistics, and location details.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Highlights & Inclusions (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Highlights Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-teal mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-amber" aria-hidden="true" />
                <span>Experience Highlights</span>
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold">✓</span>
                  <span><strong>13,000 ft Exit:</strong> Freefall with the panoramic Gulf of Thailand on the horizon.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold">✓</span>
                  <span><strong>Flight Duration:</strong> Around sixty seconds of freefall, then five to seven minutes under canopy along the coast.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold">✓</span>
                  <span><strong>No experience needed:</strong> Your USPA-certified instructor controls the jump from start to touchdown.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold">✓</span>
                  <span><strong>Consistent quality:</strong> Same aircraft, altitude, and instructors in every package tier.</span>
                </li>
              </ul>
            </div>

            {/* Standard Inclusions Checklist */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-teal mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-teal" aria-hidden="true" />
                <span>What&#39;s included</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                <div className="rounded-lg bg-brand-sand/40 p-3 border border-slate-200/60">
                  <span className="font-bold text-brand-teal">+</span> Tandem skydive experience in Pattaya, Thailand
                </div>
                <div className="rounded-lg bg-brand-sand/40 p-3 border border-slate-200/60">
                  <span className="font-bold text-brand-teal">+</span> Safety briefing and tandem instructor support
                </div>
                <div className="rounded-lg bg-brand-sand/40 p-3 border border-slate-200/60">
                  <span className="font-bold text-brand-teal">+</span> Aircraft ascent and ocean-view jump experience
                </div>
                <div className="rounded-lg bg-brand-sand/40 p-3 border border-slate-200/60">
                  <span className="font-bold text-brand-teal">+</span> Certificate of completion
                </div>
              </div>
            </div>
          </div>

          {/* Location & Good to Know FAQs (5 cols) */}
          <div id="location" className="lg:col-span-5 space-y-8 scroll-mt-20">
            {/* Where you jump */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 text-brand-teal mb-3">
                <MapPin className="w-5 h-5 text-brand-amber" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold">Where you jump</h3>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Pattaya Sea View, Pattaya, Thailand
              </p>
              <address className="not-italic text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand
              </address>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Operated by:</span>
                <span className="font-bold text-brand-teal uppercase">Dropzone Thailand</span>
              </div>
            </div>

            {/* Add-on: Bangkok Pickup */}
            <div className="rounded-xl border border-brand-amber/30 bg-amber-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-brand-dark mb-2">
                <Bus className="w-5 h-5 text-brand-amber" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold">Bangkok Pickup Add-on</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Need transportation from Bangkok? Yes, Bangkok pickup is available as a fixed-price add-on directly to the dropzone.
              </p>
            </div>

            {/* Demo Brochure Download Callout */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-brand-teal mb-2">
                <FileText className="w-5 h-5 text-brand-amber" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold">Download Brochure</h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Download the sample brochure built from the page facts containing real package prices and the 5-step plan.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Demo Material
                </span>
                <a
                  href="/media/sea-view-skydiving-brochure.pdf"
                  download="sea-view-skydiving-brochure.pdf"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-teal px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-brand-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
