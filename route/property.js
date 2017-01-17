/*********************************
 nodejs api for  

    1. 公司來往狀況
    

@ 2017.01.12
*********************************/




var async = require('async');
var sql = require('mssql');

module.exports = {
  getProperty : getPropertyAction
}


function getPropertyAction(req,res){

  var request = new sql.Request(cp);
  var id = req.params.id;

  request.query(sqlCompanyProperty(id),function(err,data){
    if (err){
      throw err  
    }else{
      res.send(data);
    }
  })

}

/**sql helper */
function sqlCompanyProperty(seedid){
  var id = seedid + '0'
  var sql_property = 
  `select 
    [最近一個月平均餘額(台外幣總存款)],
    [最近三個月平均餘額(台外幣總存款)],
    [最近六個月平均餘額(台外幣總存款)],
    [最近一年平均餘額(台外幣總存款)],
    [台外幣總存款],
    [放款總餘額(L+PB+CK)]
  from bank2016.dbo.v_cifall999_201611
  where 公司戶記號=1    
    and 身分證字號= '${id}'
  `;
  return sql_property;
}