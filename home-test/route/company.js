var async = require('async');
var sql = require('mssql');

function getCompanyInfo(seedId){
  var request = new Request(cp);
  var company = [];
  async.series([
    function(callback){
      request.query(sqlCompany(seedId),function(err,data){
        if (err){
          throw err;
        }else{
          company = company.concat(data);
          callback(null,data);
        }
      });
    },
    function(callback){
      request.query(sqlDirector(seedId),function(err,data){
        if(err){
          throw err;
        }else{
          if (company[0]!==null){
            company[0]['OWNNERS'] = data;
          }
          callback(null,data);
        }
      });
    }
  ]);
}



function sqlDirector(seedid){
  var sql_director =
  `select a.公司名稱,b.*
  from external.dbo.公司法人資料 a
    left join external.dbo.公司董監事 b
      on a.ID = b.ID
  where a.ID = '${seedid}' `
  return sql_director;
}

function sqlCompany(seedid){
  var sql_company =
  ` select *
  from 公司法人資料
  where ID = '${seedid}'
  `
  return sql_company;
}
