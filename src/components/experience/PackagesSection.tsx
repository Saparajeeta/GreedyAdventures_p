"use client";

import { useState } from "react";
import { Check, Star, Video, Camera, Sparkles, MessageSquare } from "lucide-react";
import { SafeImage } from "./SafeImage";

const commonInclusions = [
  "Tandem skydive experience in Pattaya, Thailand",
  "Safety briefing and tandem instructor support",
  "Aircraft ascent and ocean-view jump experience",
  "Certificate of completion",
];

const packages = [
  {
    id: "eco",
    name: "ECO",
    tagline: "The jump, nothing else",
    price: "฿9,500",
    priceNote: "per person",
    image: "https://www.greedyadventures.com/greedy/package-previews/eco-landscape.jpg",
    mediaHighlight: "No camera",
    mediaDescription: "Pure unrecorded jump experience without camera gear.",
    isPopular: false,
    badgeText: null,
  },
  {
    id: "deluxe",
    name: "DELUXE",
    tagline: "Video and photos included",
    price: "฿12,500",
    priceNote: "per person",
    image: "https://www.greedyadventures.com/greedy/package-previews/deluxe-landscape-poster.png",
    mediaHighlight: "Handycam video & photos",
    mediaDescription: "Wrist-mounted 4K video + high-res digital photos.",
    isPopular: true,
    badgeText: "Most Popular",
  },
  {
    id: "vip",
    name: "VIP",
    tagline: "Personal cameraman and edited film",
    price: "฿14,000",
    priceNote: "per person",
    image: "https://www.greedyadventures.com/greedy/package-previews/vip-landscape-poster.png",
    mediaHighlight: "Dedicated camera flyer",
    mediaDescription: "External flyer jumping alongside you with edited film.",
    isPopular: false,
    badgeText: "Ultimate Media",
  },
];

export function PackagesSection() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) ?? null;

  function handleAskAssistant(packageName: string) {
    window.dispatchEvent(
      new CustomEvent("ask-assistant", {
        detail: { prompt: `What is included in the ${packageName} package?` },
      })
    );
  }

  return (
    <section
      id="packages"
      aria-labelledby="packages-title"
      className="scroll-mt-16 py-20 px-4 sm:px-6 lg:px-8 bg-brand-sand border-b border-brand-teal/10"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-amber">
            Tandem Jump Packages
          </p>
          <h2
            id="packages-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-teal"
          >
            Choose your package
          </h2>
          <div className="inline-block rounded-full bg-brand-teal/5 px-4 py-1.5 border border-brand-teal/10">
            <p className="text-sm font-medium text-slate-700">
              <span className="font-semibold text-brand-teal">Same jump in every package:</span>{" "}
              same aircraft, 13,000 ft altitude, and USPA-certified instructors.
            </p>
          </div>
        </div>

        {/* 3 Package Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <article
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-xl bg-white transition duration-200 shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-2 border-brand-teal ring-4 ring-brand-teal/20 -translate-y-1"
                    : pkg.isPopular
                    ? "border-2 border-brand-teal ring-4 ring-brand-teal/10 -translate-y-1"
                    : "border border-slate-200"
                }`}
              >
                {/* Top Popular Badge */}
                {pkg.badgeText && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-teal px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-brand-amber fill-brand-amber" aria-hidden="true" />
                    <span>{pkg.badgeText}</span>
                  </div>
                )}

                <div>
                  {/* Package Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-brand-teal/5">
                    <SafeImage
                      src={pkg.image}
                      alt={`${pkg.name} package preview image`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded">
                      {pkg.tagline}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-2xl font-bold uppercase tracking-tight text-brand-teal">
                        {pkg.name}
                      </h3>
                      <div className="text-right">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                          {pkg.price}
                        </span>
                        <span className="ml-1 text-xs text-slate-500 font-medium">
                          {pkg.priceNote}
                        </span>
                      </div>
                    </div>

                    {/* Media difference callout */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal">
                        {pkg.id === "eco" && <span className="text-slate-500">Jump only</span>}
                        {pkg.id === "deluxe" && <Camera className="w-4 h-4 text-brand-amber" aria-hidden="true" />}
                        {pkg.id === "vip" && <Video className="w-4 h-4 text-brand-amber" aria-hidden="true" />}
                        <span>{pkg.mediaHighlight}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {pkg.mediaDescription}
                      </p>
                    </div>

                    {/* Inclusions list */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Included in this jump
                      </p>
                      <ul className="space-y-2.5 text-xs text-slate-700">
                        {commonInclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${pkg.name} package for ${pkg.price}`}
                    className={`min-h-[44px] w-full rounded-md font-semibold text-xs uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isSelected
                        ? "bg-brand-teal text-white ring-2 ring-brand-teal ring-offset-2"
                        : pkg.isPopular
                        ? "bg-brand-teal text-white hover:bg-brand-surface focus-visible:ring-brand-teal"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400"
                    }`}
                  >
                    {isSelected ? `✓ ${pkg.name} Selected` : `Select ${pkg.name}`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Selected Package Details Panel */}
        {selectedPkg && (
          <div
            id="selection-panel"
            aria-live="polite"
            className="mt-10 rounded-2xl border-2 border-brand-teal bg-white p-6 sm:p-8 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-teal">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Your selection</span>
                </div>
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-teal">
                    {selectedPkg.name} Package
                  </h3>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {selectedPkg.tagline} • <span className="text-slate-900 font-bold">{selectedPkg.price}</span> {selectedPkg.priceNote}
                  </p>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Included with this package
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {commonInclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 font-medium text-slate-900">
                      <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{selectedPkg.mediaDescription}</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-slate-400 italic pt-1">
                  Bookings are not part of this prototype.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAskAssistant(selectedPkg.name)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-teal px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 transition"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-brand-amber" aria-hidden="true" />
                  <span>Ask the assistant about {selectedPkg.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPackageId(null)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition"
                >
                  Choose another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small comparison table for what differs */}
        <div className="mt-14 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brand-teal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-amber" aria-hidden="true" />
            <span>What differs across packages</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose ECO for standard jump, Deluxe for handycam video, or VIP for full personal cameraman coverage.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="py-3 px-4">Feature</th>
                  <th scope="col" className="py-3 px-4">ECO (฿9,500)</th>
                  <th scope="col" className="py-3 px-4 font-bold text-brand-teal">DELUXE (฿12,500)</th>
                  <th scope="col" className="py-3 px-4">VIP (฿14,000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <th scope="row" className="py-3 px-4 font-medium text-slate-900">13,000 ft Tandem Jump</th>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-medium text-slate-900">USPA-Certified Instructor</th>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-medium text-slate-900">Camera / Media Coverage</th>
                  <td className="py-3 px-4 text-slate-400">No camera</td>
                  <td className="py-3 px-4 font-semibold text-brand-teal">Handycam 4K Video + Photos</td>
                  <td className="py-3 px-4 font-semibold text-brand-amber">Personal Cameraman + Edited Film</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-medium text-slate-900">Certificate of Completion</th>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
