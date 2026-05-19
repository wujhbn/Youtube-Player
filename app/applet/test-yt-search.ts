import ytSearch from "yt-search";
async function run() {
  try {
    const r = await ytSearch("cat");
    console.log(r.videos[0].title);
  } catch (e) {
    console.error(e);
  }
}
run();
