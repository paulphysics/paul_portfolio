import "@fontsource-variable/inter";
import "./styles.css";
import "./about.css";
import { hydrateIcons } from "./icons.js";
import { initTheme } from "./theme.js";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "./config.js";

hydrateIcons();
initTheme();

// WhatsApp button: only shown when a number is configured in src/config.js
const wa = document.getElementById("wa-btn");
const digits = String(WHATSAPP_NUMBER).replace(/\D/g, "");
if (wa) {
  if (digits.length >= 9) wa.href = `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  else wa.hidden = true;
}
