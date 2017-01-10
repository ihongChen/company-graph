var express = require('express')
var app = express()

//set db
var sql=require('mssql');
// database config
var config = {
    user: 'xxx',
    password: 'xxxxxx',
    server: 'xxxxxxxxx',
    database: 'External',
    options: {
        tdsVersion:'7_1',
        encrypt: false // Use this if you're on Windows Azure
    }
  };


global.cp = new sql.Connection(config); //connection pool

//api router
var graph = require('./route/graph') //api route

app.use(express.static(__dirname + "/public"));
app.get('/q', graph.getGraph);


// connect the pool and start web server 
cp.connect().then(function(){
  console.log('connection pool open...');
  var server =app.listen(5000,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listen at http://%s:%s',host,port);

  });
}).catch(function(err){
  console.error('Error creating connection pool',err);
});

