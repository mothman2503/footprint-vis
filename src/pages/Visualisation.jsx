import { useMediaQuery } from "react-responsive";
import DesktopVisualisation from "../components/DesktopVisualisation";
import MobileVisualisation from "../components/MobileVisualisation";
import { useDataset } from "../context/DataContext";

const Visualisation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { dataset } = useDataset();

  if (!dataset?.records?.length) {
    return <p className="text-white text-center mt-10">⚠️ No dataset selected. Please select or upload a dataset.</p>;
  }

  return isMobile ? (
    <MobileVisualisation entries={dataset.records} />
  ) : (
    <DesktopVisualisation entries={dataset.records} />
  );
};

export default Visualisation;