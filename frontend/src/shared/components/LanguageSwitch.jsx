import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import enFlag from "../../assets/flags/en.png";
import deFlag from "../../assets/flags/de.png";
import { BsChevronDown } from "react-icons/bs";

const LanguageSwitch = () => {
  const { i18n: t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang) => {
    t.changeLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const getFlag = (language) => {
    if (language === "en") return enFlag;
    if (language === "de") return deFlag;
    return null;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-white hover:border-emerald-300/60 hover:bg-white/10 transition"
      >
        <img
          src={getFlag(t.language)}
          alt={t.language === "en" ? "English" : "German"}
          className="w-7 h-5 rounded-sm"
        />
        <span className="text-xs uppercase tracking-[0.18em] text-white/70">
          {t.language}
        </span>
        <BsChevronDown className="text-white/70" />
      </button>
      <div
        className={`absolute right-0 mt-2 w-40 rounded-xl border border-white/15 bg-gradient-to-br from-[#0f1718] via-[#111c1f] to-[#17242a] shadow-2xl backdrop-blur-sm overflow-hidden transform transition-all duration-200 ${
          isOpen ? "opacity-100 translate-y-0 z-40" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={() => changeLanguage("en")}
          className={`flex items-center gap-2 px-3 py-2 w-full text-sm transition ${
            t.language === "en" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
          }`}
        >
          <img
            src={enFlag}
            alt="English"
            className="w-7 h-5 rounded-sm"
          />
          <span className="font-semibold">English</span>
        </button>
        <button
          onClick={() => changeLanguage("de")}
          className={`flex items-center gap-2 px-3 py-2 w-full text-sm transition ${
            t.language === "de" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
          }`}
        >
          <img
            src={deFlag}
            alt="German"
            className="w-7 h-5 rounded-sm"
          />
          <span className="font-semibold">Deutsch</span>
        </button>
      </div>
      {isOpen && (
        <div
          className="fixed h-dvh inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default LanguageSwitch;
