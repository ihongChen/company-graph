var express = require('express')
var app = express()

//set db
var sql=require('mssql');

// database config
var config = {
    user: 'xx',
    password: 'xxxxxx',
    server: 'xxxxxx',
    database: 'xxxxxxx',
    options: {
        tdsVersion:'7_1',
        encrypt: false 
    }
  };


global.cp = new sql.Connection(config); //connection pool



app.use(express.static(__dirname + "/public"));

/** api router*/

var graph = require('./route/graph'); //api route
var property = require('./route/property');

app.get('/company/:id', graph.getCompany);
app.get('/q', graph.getGraph);
app.get('/property/:id', property.getProperty);


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
