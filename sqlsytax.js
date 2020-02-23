app.get('/',(req,res)=>{

    connection.query("SELECT * FROM books",(err,rows,fields)=>{
            if(err)
            {
                console.log(err);
            }
            else{
                console.log('Success!!!');
                console.log(rows);
                res.send(rows);
            }
    });
});