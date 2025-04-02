import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="space-x-2">
            <button onClick={() => changeLanguage("en")} className="px-3 py-1 bg-blue-500 text-white rounded">EN</button>
            <button onClick={() => changeLanguage("de")} className="px-3 py-1 bg-gray-500 text-white rounded">DE</button>
        </div>
    );
};

export default LanguageSwitcher;