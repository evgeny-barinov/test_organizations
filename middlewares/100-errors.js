
exports.init = app => app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (e.status) {
      ctx.body = {errors: [e.message]};
      ctx.status = e.status;
      console.log(ctx);
    } else {
      ctx.body = {errors: ['Error 500']};
      ctx.status = 500;
      console.error(e.message, e.stack);
    }
  }
});
