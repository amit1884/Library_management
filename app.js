var express =require('express');
var path=require('path');
const session = require('express-session');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('./databaseconfig/configDb');
var adminRouter=require('./routes/admin');
var studentRouter=require('./routes/student');
var passport=require('passport');
var passportLocal=require('passport-local');
var app =express();
app.set("view engine","ejs");
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use('/Admin',adminRouter);
app.use('/Student',studentRouter);

app.get('/',(req,res)=>{
    res.render('index');
});

app.listen(3000,()=>{
    console.log('server started');
});