const { generatePoToken } = require('bgutils-js');
async function test() {
  const token = await generatePoToken('abcdefg');
  console.log('PO Token:', token);
}
test().catch(console.error);
