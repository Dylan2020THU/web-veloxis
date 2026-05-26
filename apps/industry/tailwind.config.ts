export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#1f2937",
        brand: {
          blue: "#067efd",
          "blue-hover": "#0569d2",
          ink: "#1a1a1a",
        },
      },
      borderRadius: {
        veloxis: "48px 0 48px 0",
      },
    },
  },
  plugins: [],
};
