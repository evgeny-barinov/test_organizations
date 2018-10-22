const Router = require('koa-router');

let router = new Router();
//const mysql = require('../libs/database');
//const Organization = require('../models/organization');

router.get('/', async (ctx, next) => {
   ctx.status = 200;
   ctx.body = 'It works';
  })
  .prefix('/organizations')
  .post('/add', async (ctx, next) => {
    ctx.status = 502;
    ctx.body = 'Not Implemented'
  })
  .get('/get/:name', async (ctx, next) => {
    console.log(ctx);
    ctx.status = 502;
    ctx.body = 'Not Implemented'
  });

module.exports = router;