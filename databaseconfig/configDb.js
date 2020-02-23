var mysql=require('mysql');

var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'library_management'
});
connection.connect((err)=>{
    if(err)
    console.log(err);
    else
    console.log('connected');
});
module.exports=configDb;