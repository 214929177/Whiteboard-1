//视图路由
exports.controller = function (app) {
    //TODO 添加路由导向html
    app.get('/view/:view',function (req,res) {
         res.sendfile('vue/'+req.params.view+'.html');
    })
}