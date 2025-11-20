import logo from "../logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypingEffect from "../shared/components/TypingEffect";
import "../i18n";

function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh w-full bg-gradient-to-br from-[#0f1a1d] via-[#0f1d24] to-[#11242b] text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-16 flex flex-col gap-10">
        <header className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              {t("nav.visualise", { defaultValue: "Visualise" })} · Privacy · Insight
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              <TypingEffect
                words={[t("Visualise your internet footprint!")]}
                speed={50}
                delay={40}
                disableSpaces
              />
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl">
              Map your search history, classify queries, and explore trends across days and months with a rich, interactive dashboard.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/visualise"
                className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition"
              >
                {t("nav.visualise", { defaultValue: "Launch Visualisation" })}
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-3 font-semibold border border-white/20 text-cyan-100 rounded-lg hover:bg-white/10 transition"
              >
                {t("nav.about", { defaultValue: "Learn more" })}
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/20 blur-3xl" />
            <div className="relative bg-[#0c1316] border border-white/10 rounded-3xl p-6 shadow-xl">
              <img
                src={logo}
                alt="logo"
                className="w-full object-contain drop-shadow-lg"
              />
              <p className="mt-4 text-sm text-gray-300">
                Built to help you understand and manage your digital footprint with clarity and control.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "By Month", desc: "Pan and zoom through months of activity with quick filters." },
            { title: "By Day", desc: "Inspect daily patterns, peak hours, and categories at a glance." },
            { title: "Classification", desc: "Classify queries, edit labels, and persist them to your datasets." },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <p className="text-cyan-300 text-sm font-semibold">{card.title}</p>
              <p className="text-gray-200 mt-2 text-sm">{card.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Home;
