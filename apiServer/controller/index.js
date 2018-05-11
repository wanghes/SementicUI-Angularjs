const Mock = require("mockjs");
// 获取 mock.Random 对象
const Random = Mock.Random;

// mock一组数据
const produceNewsData = () => {
    let articles = [];
    for (let i = 0; i < 20; i++) {
        let newArticleObject = {
            title: Random.csentence(5, 30), //  Random.csentence( min, max )
            author_name: Random.cname(), // Random.cname() 随机生成一个常见的中文姓名
            date: Random.date() + ' ' + Random.time() // Random.date()指示生成的日期字符串的格式,默认为yyyy-MM-dd；Random.time() 返回一个随机的时间字符串
        }
        articles.push(newArticleObject)
    }
    return {
        articles
    }
}

let query = (values) =>{
    return new Promise((resolve,reject) =>{
        resolve(values)
    })
}

const fetchPosts = async ctx =>{
    let result = await produceNewsData();
    if(result){
        ctx.response.body = { code:1, data:result };
    }
}

module.exports ={
    fetchPosts
}
