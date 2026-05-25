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
        hand: [
          "Caveat",
          "Comic Sans MS",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#1f2937",
        parchment: "#faf7ef",
        // Marketing-site brand palette — kept here so the roadmap and the
        // main veloxisai.com site share a single source of truth.
        brand: {
          blue: "#067efd", // 大川蓝 (matches CSS var --primary-blue)
          "blue-hover": "#0569d2",
          ink: "#1a1a1a", // 大川激流主文字色
        },
      },
      boxShadow: {
        soft: "0 6px 20px -8px rgba(31, 41, 55, 0.18)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        floatIn: "floatIn 220ms ease-out both",
      },
    },
  },
  plugins: [],
};
