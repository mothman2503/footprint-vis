import { useState } from "react";
import { Link } from "react-router-dom";
import navLinks from "../navLinks";
import { VscClose } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import "../i18n";

const NavigationMenu = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  // Disable scrolling when menu is

  // Function to handle dynamic translation based on the link path
  const getTranslation = (link) => {
    switch (link) {
      case "/":
        return t("nav.home");
      case "/about":
        return t("nav.about");
      case "/datasets":
        return t("nav.datasets");
      case "/visualisation":
        return t("nav.visualisation");
      default:
        return link.label; // Fallback to the label if the key doesn't exist
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="flex justify-start fixed h-14 top-0 z-50">
        <div
          className="fixed top-0 left-0 pt-4 pl-3 pr-4 z-50 flex flex-col gap-[5px] cursor-pointer bg-[black] h-14"
          onClick={() => setIsOpen(true)}
        >
          {[3, 2.5, 1.5].map((width, i) => (
            <span
              key={i}
              className="block h-[4px] bg-white rounded-[1px] origin-left animate-grow "
              style={{
                width: `${width * 10}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-4/6 max-w-80 bg-slate-200/30 backdrop-blur-sm transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-50 shadow-lg`}
      >
        {/* Close Button */}
        <VscClose
          size={25}
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4"
        />

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
                  {getTranslation(link)} {/* Use the translated label here */}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay (to close menu when clicking outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default NavigationMenu;
