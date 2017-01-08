var express = require('express')
var app = express()

//set db
var sql=require('mssql');
// database config
var config = {
    user: 'sa',
    password: 'xxxxxxxxx',
    server: 'xxxxxxxxx',
    database: 'xxxxx',
    options: {
        tdsVersion:'7_1',
        encrypt: false // Use this if you're on Windows Azure
    }
  };

sql.connect(config, function(err){
    if(err) {
        console.log(err);
        return;
    }
    console.log("connected to db.");
});

app.use(express.static(__dirname + "/public"));

// app.use(function(req, res, next) {
//   res.contentType('application/json');
//   next();
// });

var server = app.listen(5000, function () {
    console.log('Server is running..');
});


//api router
var graph = require('./route/graph') //api route

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// GET方法的路由，處理「/」路徑
app.get('/q', graph.getGraph);
