import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

// Extension build (Node.js)
const extensionBuildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  external: ["vscode", "ws"],
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: false,
  minify: false,
  logLevel: "info",
};

// ChatView build (Browser, regular TypeScript)
const chatViewBuildOptions = {
  entryPoints: ["src/chatView.ts"],
  bundle: true,
  outfile: "out/chatView.js",
  external: ["vscode", "ws", "fs", "path", "os", "url", "child_process"],
  format: "iife",
  platform: "browser",
  target: "es2020",
  sourcemap: false,
  minify: false,
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(extensionBuildOptions);
  await ctx.watch();
  const cvCtx = await esbuild.context(chatViewBuildOptions);
  await cvCtx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(extensionBuildOptions);
  console.log("Extension build complete.");
  await esbuild.build(chatViewBuildOptions);
  console.log("ChatView build complete.");
}
