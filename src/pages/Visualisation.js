import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import DesktopVisualisation from "./DesktopVisualisation";
import MobileVisualisation from "./MobileVisualisation";
import { openDB } from "idb";

const Visualisation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [rawJson, setRawJson] = useState(null);

  // Load from IndexedDB
  useEffect(() => {
    const fetchData = async () => {
      const db = await openDB("fileStorage", 1);
      const file = await db.get("files", "History.json");
      if (file?.data) setRawJson(file.data);
    };
    fetchData();
  }, []);

  return isMobile ? (
    <MobileVisualisation rawJson={rawJson} />
  ) : (
    <DesktopVisualisation rawJson={rawJson} />
  );
};

export default Visualisation;
