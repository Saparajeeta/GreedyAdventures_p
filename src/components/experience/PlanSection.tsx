import { SafeImage } from "./SafeImage";

const steps = [
  {
    number: "01",
    title: "Arrival and check-in",
    description: "Sign in at the dropzone and bring your photo ID.",
    image: "https://www.greedyadventures.com/greedy/trips/dropzone-thailand-check-in.jpg",
    alt: "Guests completing check-in paperwork at the Dropzone Thailand reception desk",
  },
  {
    number: "02",
    title: "Safety briefing and gear fitting",
    description: "Meet your instructor for the safety briefing and harness fitting.",
    image: "https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/sea-view-tandem-skydive-pattaya/108d38.jpg",
    alt: "Instructor fitting a tandem customer harness at the Pattaya dropzone",
  },
  {
    number: "03",
    title: "Boarding and the climb",
    description: "Board the aircraft and climb to jump altitude.",
    image: "https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/plane.webp",
    alt: "Jump aircraft at the Pattaya dropzone",
  },
  {
    number: "04",
    title: "Exit and freefall",
    description: "Exit with your instructor for freefall over the Gulf of Thailand.",
    image: "https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/tandem-with-sea-view.webp",
    alt: "Tandem skydive over the Gulf of Thailand",
  },
  {
    number: "05",
    title: "Canopy flight and landing",
    description: "Fly under the parachute with your instructor and land back at the dropzone.",
    image: "https://www.greedyadventures.com/greedy/trips/tandem-canopy-landing-g0250281.jpg",
    alt: "Tandem passenger and instructor coming in to land under a black and yellow canopy at Dropzone Thailand",
  },
];

export function PlanSection() {
  return (
    <section
      id="the-plan"
      aria-labelledby="plan-title"
      className="scroll-mt-16 py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-brand-teal/10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-amber">
            Step-By-Step Journey
          </p>
          <h2
            id="plan-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-teal"
          >
            The plan
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            From the moment you arrive at the dropzone to your beachside landing,
            every step is engineered for safety, excitement, and peace of mind.
          </p>
        </div>

        <ol className="mt-16 space-y-10 sm:space-y-12">
          {steps.map((step, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <li
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-brand-sand/30 p-6 sm:p-8 transition hover:border-brand-teal/30 hover:bg-brand-sand/60"
              >
                <article
                  className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${
                    isReversed ? "md:grid-flow-dense" : ""
                  }`}
                >
                  {/* Step Image */}
                  <div
                    className={`md:col-span-6 relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 shadow-sm ${
                      isReversed ? "md:col-start-7" : ""
                    }`}
                  >
                    <SafeImage
                      src={step.image}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Step Content */}
                  <div
                    className={`md:col-span-6 space-y-4 ${
                      isReversed ? "md:col-start-1" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-3xl font-bold text-brand-amber">
                        {step.number}
                      </span>
                      <span className="h-px w-10 bg-brand-amber/40" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Step {idx + 1} of 5
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-teal tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-base text-slate-700 leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        {/* Quick summary strip */}
        <div className="mt-12 rounded-xl bg-brand-teal p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-brand-sand">
              Total Dropzone Experience
            </h4>
            <p className="text-xs text-slate-300">
              Please allocate approximately 3 hours on-site for check-in, briefing, ascent, and jump.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-brand-amber">
            <span>* 13,000 ft altitude</span>
            <span>* ~60s freefall</span>
            <span>* 5–7 min canopy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
