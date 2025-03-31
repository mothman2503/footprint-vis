import { useMediaQuery } from "react-responsive";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";

const Navbar = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
};

export default Navbar;
