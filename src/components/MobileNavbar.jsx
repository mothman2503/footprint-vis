import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import navLinks from "../navLinks";
import { VscMenu, VscClose } from "react-icons/vsc";
import LanguageSwitcherMobile from "./LanguageSwitcherMobile";
import { useTranslation } from "react-i18next";
import "../i18n";

const MobileNavbar = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  // Disable scrolling when menu is open
  

  // Trigger navbar visibility when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true); // After the page loads, make navbar visible
    }, 200); // Delay to allow other components to load

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  // Function to handle dynamic translation based on the link path
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
    <>
      {/* Sticky Navbar */}
      <div
        className={`bg-slate-200/30 backdrop-blur-sm w-full sticky top-0 flex flex-wrap p-3 space-x-8 items-center justify-between z-40 
        transform transition-all duration-500 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-[-100%]"}`}
      >
        {/* Hamburger Icon */}
        <VscMenu size={30} onClick={() => setIsOpen(true)} />

        <LanguageSwitcherMobile />
      </div>

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-4/6 max-w-80 bg-slate-200/30 backdrop-blur-sm transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-40 shadow-lg`}>

        {/* Close Button */}
        <VscClose size={25} onClick={() => setIsOpen(false)} className="absolute top-4 right-4" />

        {/* Navigation Links */}
        <nav className="mt-12 p-4">
          <ul className="space-y-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link} // Assuming each link has a 'path' property
                  className="block py-2 px-4 text-lg font-mono font-semibold text-white no-underline hover:text-sky-950 hover:italic"
                  onClick={() => setIsOpen(false)} // Close menu on link click
                >
                  {getTranslation(link)}  {/* Use the translated label here */}
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
