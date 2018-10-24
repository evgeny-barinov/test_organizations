const config = require('config');

// process.on('unhandledRejection', (reason, p) => {
//   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
// });

const app = require('./app');
app.listen(config.get('port'));