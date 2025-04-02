import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import navLinks from "../navLinks";
import { VscMenu, VscClose } from "react-icons/vsc";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import "../i18n";

const MobileNavbar = () => {
  const { t } = useTranslation(); 

  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      <div className="bg-slate-50/85 backdrop-blur-sm max-w-full sticky top-0 flex flex-wrap p-3 space-x-8 items-center shadow-lg z-40">
        {/* Hamburger Icon */}
        <VscMenu size={30} onClick={() => setIsOpen(true)} />
        <LanguageSwitcher />
      </div>

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-4/6 max-w-80 bg-slate-50/85 backdrop-blur-sm transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"
        } 
        transition-transform duration-300 ease-in-out z-40 shadow-lg`}>

        {/* Close Button */}
        <VscClose size={25} onClick={() => setIsOpen(false)} className="absolute top-4 right-4" />

        {/* Navigation Links */}
        <nav className="mt-12 p-4">
          <ul className="space-y-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className="block py-2 px-4 text-lg font-mono font-semibold no-underline hover:text-sky-950 hover:italic"
                  onClick={() => setIsOpen(false)} // Close menu on link click
                >
                  {t(`nav.${link.label}`, { defaultValue: link.label })}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay (to close menu when clicking outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsOpen(false)}>

        </div>
      )}
    </>
  );
};

export default MobileNavbar;
