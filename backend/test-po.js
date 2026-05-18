const { generate } = require('youtube-po-token-generator');
console.log('Generating...');
generate().then(res => {
  console.log('Result:', res);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
