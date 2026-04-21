export default function manifest() {
  return {
    name: "Varo",
    short_name: "Varo",
    description: "Tus finanzas claras, decisiones inteligentes.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090F",
    theme_color: "#07090F",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable any",
      },
    ],
  };
}
