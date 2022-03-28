var express=require('express');
var cookieparser=require('cookie-parser');
var session=require('express-session')
var fs=require('fs');
var multer=require('multer');
var path = require('path');

var app=express();
var bodyparser=require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(cookieparser());
app.use(session({secret:"secret key"}));
app.use(express.static(__dirname+"/public"))
app.use(express.static(__dirname+"/uploads"))
app.set("view engine","pug");
app.set("views","./views")


app.post("/register",function(req,res)
{
     var obj={};
     obj.username=req.body.username;
     obj.password=req.body.password;
     var r = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var tem = JSON.parse(r);  
     tem.users.push(obj);
     fs.writeFileSync("database.json",JSON.stringify(tem),'utf-8');
     res.redirect("/login.html");
})


var temp=0;
//checking login credentials
app.get("/loginpage",function(req,res){
    var rawdata = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var alldata = JSON.parse(rawdata);
    var userdetails=alldata.users;
    req.session.user=req.query;
    userdetails.forEach(function(a,b)
    {
        if(a.username==req.session.user.username && a.password==req.session.user.password)
        {
            temp=1;
        }
    })
    if(temp==1)
    {
        //res.redirect("/home.html");
        //var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
        //var temp = JSON.parse(rd);
        //res.render("getfood",{food:temp.food})
        res.cookie("username",req.query.username);
            res.cookie("password",req.query.password);
        res.redirect("/getfood")
    }
    else{
        res.redirect("/register.html");
    }
})
app.get('/',function(req,res){
    res.redirect("/login.html")

})

app.get("/getfood",function(req,res){
    if(req.cookies.username){
        var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    res.render("getfood",{food:temp.food,user:req.cookies.username})
    }
    else{
        res.redirect("/login.html")
    }
    

})
app.post("/displayfood",function(req,res){
    if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    res.render("display",{food:temp.food,pla:req.body.loc,user:req.cookies.username})
    }
    else{
        res.redirect("/login.html")
    }

})
app.get("/ordered/:id",function(req,res){
    if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    var rid=req.params.id
    var fi=temp.food
    fi.forEach(function(item,index){
        if(item.id==rid){
            var obj={};
            obj.name=item.name;
            obj.peoplecount=item.peoplecount;
            obj.price=item.price;
            obj.remark=item.remark;
            obj.location=item.location;
            obj.delivery=item.delivery;
            obj.img=item.img;
            obj.uploadby=item.uploadby;
            obj.id=item.id;
            obj.placedby=req.cookies.username;
            temp.allorders.push(obj);
        }

    })
    
     //console.log(obj);
     
     fs.writeFileSync("database.json",JSON.stringify(temp),'utf-8');
     //res.render("getfood",{food:temp.food})
     //res.send("Successfully placed order")

    res.redirect("/placedfood")
    //res.render("getfood",{food:temp.food})
    //next()
}
else{
    res.redirect("/login.html")
}

})
app.get("/placedfood",function(req,res){
    if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    res.render("placed",{food:temp.allorders,un:req.cookies.username,user:req.cookies.username})
    }
    else{
        res.redirect("/login.html") 
    }

})
app.get("/uploadfood",function(req,res){
    if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    res.render("upload",{food:temp.food,un:req.cookies.username,user:req.cookies.username})
    }
    else{
        res.redirect("/login.html") 
    }

})
app.get("/ordersgot",function(req,res){
    if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd);
    res.render("got",{food:temp.allorders,un:req.cookies.username,user:req.cookies.username})
    }
    else{
        res.redirect("/login.html")  
    }

})
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,__dirname+'/uploads')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);

    }
})
var abc=multer({storage:storage})

app.get("/addfood",function(req,res){
    res.render("addfood",{user:req.cookies.username})
})
app.post("/foodadd",abc.single("pic"),function(req,res)
{   if(req.cookies.username){
    var rd = fs.readFileSync(path.resolve(__dirname, 'database.json'));
    var temp = JSON.parse(rd); 
    var obj={};
     obj.name=req.body.name;
     obj.peoplecount=req.body.peoplecount;
     obj.price=req.body.price;
     obj.remark=req.body.remark;
     obj.location=req.body.location;
     obj.delivery=req.body.delivery;
     obj.img=req.file.filename;
     obj.uploadby=req.cookies.username;
     obj.id=temp.food.length+1
     
     temp.food.push(obj);
     fs.writeFileSync("database.json",JSON.stringify(temp),'utf-8');
     res.redirect("/uploadfood")
}
else{
    res.redirect("/login.html")   
}
})

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('password');
    res.redirect('/login.html');
});



app.listen(4424,()=>{console.log("4424 is running")});