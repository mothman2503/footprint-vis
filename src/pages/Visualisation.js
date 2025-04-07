import { useMediaQuery } from "react-responsive";
import DesktopVisualisation from "./DesktopVisualisation";
import MobileVisualisation from "./MobileVisualisation";

const Visualisation = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
  
    return isMobile ? <MobileVisualisation /> : <DesktopVisualisation />;
  };
  
export default Visualisation;
