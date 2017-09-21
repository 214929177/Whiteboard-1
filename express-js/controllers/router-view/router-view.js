//视图路由
exports.controller = function (app) {
    //TODO 添加路由导向html
    app.get('/view/:view',function (req,res) {
         if("room" == req.params.view &&!req.session.login){
             res.sendfile('vue/'+404+'.html');
         }
         res.sendfile('vue/'+req.params.view+'.html');
    });
    app.get('/view/:path/:view',function (req,res) {
        res.sendfile('vue/'+req.params.path+req.params.view+'.html');
    });
}