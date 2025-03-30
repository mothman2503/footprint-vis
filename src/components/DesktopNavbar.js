import { Link } from "react-router-dom";
import logo from '../logo.png';

import navLinks from "../navLinks";

const DesktopNavbar = () => {
  return (
    <nav>
      <div style={{backgroundColor : '#fff', color : '#000', maxWidth:"100vw", alignItems:"center", display:"flex", flexDirection:"row", boxShadow : '2px 2px 2px 1px rgb(0 0 0 / 20%)', flexWrap : 'wrap'}}>

      <img src={logo} className="" alt="logo" style={{maxWidth : '90px', margin : '5px'}}/>


        {navLinks.map((link, index) => (
          <h3 key={index} style={{marginInline : '15px'}}>
            <Link style={{textDecoration : 'none'}} to={link.path}>{link.label}</Link>
          </h3>
        ))}
      </div>
    </nav>
  );
};

export default DesktopNavbar;
