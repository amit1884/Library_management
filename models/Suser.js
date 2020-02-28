var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');
var SUserSchema=new mongoose.Schema({
    username:String,
    firstName:String,
    password:String
});
SUserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Suser',SUserSchema);