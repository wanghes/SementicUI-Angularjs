// const convert = require('koa-convert');
// const staticCache = require('koa-static-cache');
//静态文件服务
// app.use(convert(staticCache(path.join(__dirname, './'), {
//     maxAge: 365 * 24 * 60 * 60
// })));
//app.use(koajwt({ secret: 'shhhhhh', debug: true }).unless({ path: ['/doLogin']}));
const Koa = require("koa");
const route = require('koa-route');
const cors = require('koa-cors');
const moment = require('moment');
const compress = require('koa-compress');
const koaBody = require('koa-body');
const path = require('path');
const app = new Koa();
const router = require("./controller/index.js")

app.use(cors());
app.use(koaBody());

app.use(route.get('/api/posts', router.fetchPosts));

app.use(compress()); //对资源文件进行压缩

app.listen(3000,"0.0.0.0")
