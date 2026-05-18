const fs = require('fs');
const Innertube = require('youtubei.js').Innertube;

async function test() {
  const yt = await Innertube.create({ clientType: 'TV_EMBEDDED' });
  try {
    const info = await yt.getBasicInfo('VOLKJJvfAbg');
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    console.log('Stream URL:', format.url);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
