import { Link } from "react-router-dom";
import logo from '../logo.png';
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import "../i18n";

import navLinks from "../navLinks";

const DesktopNavbar = () => {
  const { t } = useTranslation();

  // Function to handle dynamic translation based on the path
  const getTranslation = (link) => {
    switch (link) {
      case '/':
        return t('nav.home');
      case '/about':
        return t('nav.about');
      case '/datasets':
        return t('nav.datasets');
        case '/visualisation':
        return t('nav.visualisation');
      default:
        return link.label;  // Fallback to the label if the key doesn't exist
    }
  };
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  // Trigger navbar visibility when the component mounts
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true); // After the page loads, make navbar visible
      }, 200); // Delay to allow other components to load
  
      return () => clearTimeout(timer); // Clean up the timer
    }, []);
  
  return (
    <div className={`bg-slate-200/30 backdrop-blur-sm w-full h[80px] sticky top-0 flex flex-wrap space-x-8 items-center z-40 px-3 transform transition-all duration-500 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-[-100%]"}`}>
      <img src={logo} className="max-w-20" alt="logo" />

      {navLinks.map((link, index) => (
        <p key={index}>
          <Link className="font-mono font-semibold text-xl text-white no-underline hover:text-sky-950 hover:italic" to={link}>
            {getTranslation(link)}
          </Link>
        </p>
      ))}
<div className="flex grow" />
      <LanguageSwitcher />
    </div>
  );
};
  
export default DesktopNavbar;
