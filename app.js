const Koa = require('koa');
const app = new Koa();

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();
handlers.forEach(handler => require('./middlewares/' + handler).init(app));

app.use(require('./controllers/main').routes());

module.exports = app;