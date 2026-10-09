import { defineConfig } from "mygo-cli";

export default defineConfig({
  name: "NCR Egg Check",
  identifier: "app.ncreggcheck.desktop",
  version: "1.0.0",
  icon: "ui-draft/public/empty-placeholder.png",
  devUrl: "http://127.0.0.1:5173",
  devCommand: "npm --prefix ui-draft run dev",
  buildCommand: "npm --prefix ui-draft run build",
  frontendDist: "ui-draft/dist",
  bindings: "ui-draft/src/mygo.ts",
  out: "build",
});
