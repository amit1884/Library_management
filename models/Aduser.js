var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');
var AdUserSchema=new mongoose.Schema({
    username:String,
    firstName:String,
    password:String
});
AdUserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Aduser',AdUserSchema);