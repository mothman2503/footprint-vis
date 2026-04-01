import React, { useEffect, useState } from "react";
import { useConsent } from "../../app/providers/ConsentProvider";

const CookieConsent = () => {
  const { consent, setConsent } = useConsent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(consent === null);
  }, [consent]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#11171b] shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">
            Privacy
          </p>
          <h3 className="text-lg font-semibold text-white">
            Local data storage consent
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            We keep your uploaded datasets and last selection in your browser
            (IndexedDB/localStorage) so the app works offline. Nothing is sent
            to a server. Choose whether we should keep these local saves after
            this session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => setConsent("declined")}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Decline (session only)
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-black shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            Accept local saves
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
