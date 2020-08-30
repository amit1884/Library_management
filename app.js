var express =require('express');
var path=require('path');
const session = require('express-session');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('./databaseconfig/configDb');
var adminRouter=require('./routes/admin');
var studentRouter=require('./routes/student');
const nodemailer = require("nodemailer");
var app =express();
app.set("view engine","ejs");
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use('/Admin',adminRouter);
app.use('/Student',studentRouter);

app.get('/',(req,res)=>{
    finecalculation();
    finealert();
    res.render('index')
    
});

function finecalculation()
{
   var sql="SELECT * FROM fineflag";
   connection.query(sql,(err,rows,fields)=>{

    if(err)
    console.log(err)
    else
    {
        var tabledate=new Date(rows[0].reload_date);
        console.log(rows[0].reload_date)
        var curreload_date=new Date();
        var reloaddiff=Math.floor((curreload_date.getTime()-tabledate.getTime())/(1000*3600*24));
        console.log('Reload Day difference  '+reloaddiff);
        if(reloaddiff>0)
        {
            var sql="SELECT * FROM issuebooks";
            connection.query(sql,(err,row,fields)=>{

                if(err)
                console.log(err);
                else{
                    var current=new Date();
                    for(var i=0;i<row.length;i++)
                    {
                        var duedate=row[i].return_date;
                        var daysdiff=Math.floor((current.getTime()-duedate.getTime())/(1000*3600*24));
                        console.log('No Of days Due  '+daysdiff);
                        if(daysdiff>0)
                        {
                        var sql="UPDATE issuebooks SET fine ='"+daysdiff*5+"' WHERE book_id='"+row[i].book_id+"'";
                        connection.query(sql,(err,rows,fields)=>{
                            if(err)
                            console.log(err);
                            else{
                            console.log('Update ho gaya');
                            var curr=new Date();
                            console.log(curr);
                            var sql="UPDATE fineflag SET reload_date = '"+curr+"' WHERE id='1'";
                            connection.query(sql,(err,result,fields)=>{
                                if(err)
                                console.log(err);
                                else{
                                console.log('fineflag table update ho gaya')
                                }
                            })
                        }
                        })
                    }
                    }
                }
            })
        }
        else{
            console.log('Once Updated');
        }
    }
   })
}
//==================================================================
//Fine alert message function
//==================================================================

function finealert(){

    var sql="SELECT * FROM issuebooks";
    connection.query(sql,(err,rows,fields)=>{

        for(var i=0;i<rows.length;i++)
        {
            var current=new Date();
            var returnDate=new Date(rows[i].return_date);
            var currtime=current.getTime();
            var rettime=returnDate.getTime();
            var daysdiff=Math.floor((rettime-currtime)/(1000*3600*24));
            console.log(daysdiff);
            if(daysdiff>=3){

                var reg=rows[i].reg_no;
                var sql="SELECT * FROM students WHERE registration_no='"+reg+"'";
                connection.query(sql,(err,row,fields)=>{
                    var emailId=row[0].email;


                    let transporter = nodemailer.createTransport({
                        service:'gmail',
                        auth: {
                          user: 'cseamit084@gmail.com', 
                          pass: 'thisismypassword'
                        }
                      });
                    
                    
                      let mailOptions ={
                        from: 'cseamit084@gmail.com', 
                        to: emailId,
                        subject: "Alert message For Library Due Date", 
                        text: "Dear '"+row[0].registration_no+"' Your Due Date for returning the is near.Kindly return the book on time",
                        html: "<p>Dear '"+row[0].registration_no+"' Your Due Date for returning the  book  is near.Kindly return the book on time</p>" 
                      };
                    transporter.sendMail(mailOptions,(error,info)=>{
                        if(error)
                        console.log(error)
                        else{
                            console.log(emailId);
                            console.log('Email Sent: '+info.response);
                        }
                    });
                    
                    
                })
            }
            else{
                console.log('No Mail Is required now')
            }
        }
    })

}


 


app.listen(3000,()=>{
    console.log('server started');
});