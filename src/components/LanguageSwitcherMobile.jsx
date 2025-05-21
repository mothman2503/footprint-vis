import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import enFlag from "../assets/flags/en.png";  // Path to English flag image
import deFlag from "../assets/flags/de.png";  // Path to German flag image
import { BsChevronDown } from "react-icons/bs";  // Dropdown icon

const LanguageSwitcherMobile = () => {
    const { i18n: t } = useTranslation();

    
    const [isOpen, setIsOpen] = useState(false);  // State to toggle the dropdown visibility

    const changeLanguage = (lang) => {
        t.changeLanguage(lang);
        setIsOpen(false);  // Close dropdown after language change
    };

    // Disable scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = "hidden"; // Prevent scrolling
        } else {
          document.body.style.overflow = "auto"; // Restore scrolling
        }
    
        return () => {
          document.body.style.overflow = "auto"; // Cleanup when component unmounts
        };
      }, [isOpen]);
    


    // Function to return the flag image based on the current language
    const getFlag = (language) => {
        if (language === 'en') return enFlag;  // Return the English flag
        if (language === 'de') return deFlag;  // Return the German flag
        return null;  // Fallback, though it's unnecessary in this case
    };

    return (
        <div className="relative">  {/* Make the button container relative for positioning */}
            <button
                onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility
                className="flex items-center p-2 hover:bg-gray-200 w-full">
                <img
                    src={getFlag(t.language)}  // Use the getFlag function to load the correct flag
                    alt={t.language === "en" ? "English" : "German"}  // alt text changes based on language
                    className={`w-7 h-5 rounded-sm mr-2`}
                />
                <BsChevronDown/>
            </button>

            {/* Dropdown menu */}
            <div className={`absolute -top-4 right-0 max-w-full w-24 bg-slate-50/95 backdrop-blur-sm shadow-lg rounded-md pb-2 pt-5
                transform transition-all duration-300 ease-in-out
                ${isOpen ? "opacity-100 translate-y-0 z-40" : "opacity-0 -translate-y-full z-0"}`}>

                <button
                    onClick={() => changeLanguage("en")}
                    className="flex items-center p-2 hover:bg-gray-200 w-full font-mono text-sm">
                    <img
                        src={enFlag}
                        alt="English"
                        className={`w-7 h-5 rounded-sm mr-2 ${t.language === "en" ? "" : "opacity-65"}`}
                    />

                    EN
                </button>
                <button
                    onClick={() => changeLanguage("de")}
                    className="flex items-center p-2 hover:bg-gray-200 w-full font-mono text-sm">
                    <img
                        src={deFlag}
                        alt="German"
                        className={`w-7 h-5 rounded-sm mr-2 ${t.language === "de" ? "" : "opacity-65"}`}
                    />

                    DE
                </button>
            </div>

            {/* Overlay (to close menu when clicking outside) */}
      {isOpen && (
        <div
          className="fixed h-dvh inset-0 bg-black opacity-20 z-30"
          onClick={() => setIsOpen(false)}>

        </div>
      )}
        </div>


    );
};

export default LanguageSwitcherMobile;
