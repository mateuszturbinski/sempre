import type { NextConfig } from "next";

// GITHUB_PAGES=1 → statyczny eksport (out/index.html) pod https://mateuszturbinski.github.io/sempre/
// Bez tej zmiennej zwykły build serwerowy (VPS: `next start`).
const pages = process.env.GITHUB_PAGES === "1";
const basePath = pages ? "/sempre" : "";

const nextConfig: NextConfig = {
  ...(pages && {
    output: "export",
    basePath,
    trailingSlash: true,
    // GitHub Pages nie ma optymalizatora obrazów — zdjęcia są wcześniej skompresowane do WebP.
    images: { unoptimized: true },
  }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
