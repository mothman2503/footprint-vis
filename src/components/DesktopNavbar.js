import { Link } from "react-router-dom";
import logo from '../logo.png';
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import "../i18n";

import navLinks from "../navLinks";

const DesktopNavbar = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50/85 backdrop-blur-sm max-w-full sticky top-0 flex flex-wrap space-x-8 items-center shadow-lg z-40">
      <img src={logo} className="max-w-20" alt="logo" />

      {navLinks.map((link, index) => (
        <p key={index}>
          <Link className="font-mono font-semibold text-xl no-underline hover:text-sky-950 hover:italic" to={link.path}>
          {t(`nav.${link.label}`, { defaultValue: link.label })}
          </Link>
        </p>
      ))}

      <LanguageSwitcher />
    </div>
  );
};
  
export default DesktopNavbar;