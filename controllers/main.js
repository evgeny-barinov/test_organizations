const Router = require('koa-router');
const Organization = require('../models/organization');

let router = new Router();

router
  .get('/', async (ctx) => {
   ctx.status = 200;
   ctx.body = 'It works';
  })
  .prefix('/organization')
  .post('/', async (ctx) => {
    const data = ctx.request.body;

    const o = new Organization();
    await o.create(data);

    ctx.body = {};
  })
  .get('/:name/:page*', async (ctx) => {
    const o = new Organization();
    const list = await o.getByName(ctx.params.name, ctx.params.page);
    if (list.length) {
      ctx.status = 200;
      ctx.body = list;
    } else {
      ctx.status = 404;
      ctx.body = {};
    }
  });

module.exports = router;