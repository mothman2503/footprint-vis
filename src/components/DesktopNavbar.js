import { Link } from "react-router-dom";
import logo from '../logo.png';
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
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

  return (
    <div className="bg-slate-50/85 backdrop-blur-sm max-w-full sticky top-0 flex flex-wrap space-x-8 items-center shadow-lg z-40">
      <img src={logo} className="max-w-20" alt="logo" />

      {navLinks.map((link, index) => (
        <p key={index}>
          <Link className="font-mono font-semibold text-xl no-underline hover:text-sky-950 hover:italic" to={link}>
            {getTranslation(link)}
          </Link>
        </p>
      ))}

      <LanguageSwitcher />
    </div>
  );
};
  
export default DesktopNavbar;
