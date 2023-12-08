import * as esbuild from "esbuild";
import start from "@es-exec/esbuild-plugin-start";
import copyStaticFiles from "esbuild-copy-static-files";

/**
 * @type {import('esbuild').BuildOptions}
 */

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  tsconfig: "tsconfig.json",
  outfile: "dist/index.js",
};
const copyFilePlugin = copyStaticFiles({
  src: "./src/public",
  dest: "./dist/public",
  recursive: true,
});

const isWatch = process.argv.slice(2).includes("--watch");
if (isWatch) {
  const ctx = await esbuild.context({
    ...options,
    sourcemap: true,
    plugins: [
      copyFilePlugin,
      start({
        script: "node -r dotenv/config --enable-source-maps ./dist/index.js",
      }),
    ],
  });
  ctx.watch({});
} else {
  //PROD BUILD SCRIPT
  const ctx = await esbuild.build({ ...options, plugins: [copyFilePlugin] });
  ctx.rebuild();
}
