import React from "react";
import { useTranslation } from "react-i18next";
import enFlag from "../assets/flags/en.png";  // path to English flag image
import deFlag from "../assets/flags/de.png";  // path to German flag image

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="space-x-2">
            <button onClick={() => changeLanguage("en")} className="p-1 rounded">
                <img src={enFlag} alt="English" className={`w-7 h-5 rounded-sm ${ i18n.language === "en" ? "" : "opacity-65"} `}/>
            </button>
            <button onClick={() => changeLanguage("de")} className="p-1 rounded">
                <img src={deFlag} alt="German" className={`w-7 h-5 rounded-sm ${ i18n.language === "de" ? "" : "opacity-65"} `}/>
            </button>
        </div>
    );
};

export default LanguageSwitcher;
