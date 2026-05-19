async function run() {
  const mod = await import("yt-search");
  console.log("Keys:", Object.keys(mod));
  console.log("Default:", typeof mod.default);
}
run();
