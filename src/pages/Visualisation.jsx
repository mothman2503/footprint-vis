import { useMediaQuery } from "react-responsive";
import DesktopVisualisation from "../components/DesktopVisualisation";
import MobileVisualisation from "../components/MobileVisualisation";

const Visualisation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return isMobile ? (
    <MobileVisualisation />
  ) : (
    <DesktopVisualisation />
  );
};

export default Visualisation;
