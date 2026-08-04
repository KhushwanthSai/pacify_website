import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { fetchPublicSettings } from "@/lib/settings";

/**
 * Site-wide banner driven by the `maintenance_mode` admin setting.
 *
 * Renders nothing until settings load, so a slow read never flashes a banner
 * at users during normal operation.
 */
export function MaintenanceBanner() {
  const [visible, setVisible] = useState(false);
  const [siteName, setSiteName] = useState("Placify AI");

  useEffect(() => {
    let active = true;
    fetchPublicSettings().then((s) => {
      if (!active) return;
      setVisible(s.maintenance_mode);
      setSiteName(s.site_name);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-amber-500/15 border-b border-amber-500/30 text-amber-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 text-sm">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">{siteName}</strong> is in
          maintenance mode. Some features may be unavailable.
        </span>
      </div>
    </div>
  );
}
