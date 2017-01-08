var express = require('express');
var app = express();

app.use(express.static(__dirname+'/public'));
var sql = require('mysql');

global.pool = sql.createPool(
  {
    connectionLimit:10,
    host:'ihongchen.ctbx4pq8or72.us-west-2.rds.amazonaws.com',
    port:'3306',
    user:'ehome4829',
    password:'a126234829',
    database:'test'
  }
);

app.listen(3000,function(){
  console.log('running server at 3000 port..');
});

//router
var graph = require('./route/graph_db');
app.get('/q',graph.getGraph);
