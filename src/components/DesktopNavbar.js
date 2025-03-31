import { Link } from "react-router-dom";
import logo from '../logo.png';

import navLinks from "../navLinks";

const DesktopNavbar = () => {
  return (
    <div className="bg-slate-100/85 backdrop-blur-sm max-w-full sticky top-0 flex flex-wrap space-x-8 items-center shadow-lg z-40">

      <img src={logo} className="max-w-20" alt="logo" />


      {navLinks.map((link, index) => (
        <p key={index}>
          <Link className="font-mono font-semibold text-xl no-underline	hover:text-sky-950 hover:italic" to={link.path}>{link.label}</Link>
        </p>
      ))}
    </div>
  );
};

export default DesktopNavbar;
