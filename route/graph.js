/*********************************
 nodejs api for  

    1. 公司關係結構
    2. 公司外部資訊

@ 2017.01.12
*********************************/


var async = require('async');
var sql = require('mssql');


module.exports = {
  getGraph: getGraphAction,
  getCompany : getCompanyAction
}
  /******************/
  /**取得關係圖結構 */
  /******************/
function getGraphAction(req,res){

  var query = req.query;
  var seedid = query.id; //seedid
  var finalResults = [];

  if (seedid!=null){
    // seedid持有
    var sql_q1_own = sqlOwn(seedid);
    // seedid被持有
    var sql_q1_belong = sqlBelong(seedid);
  }else{
    console.log('not valid query...');
    return;
  }



  getCompanyRelation(seedid,function(err,ans){
    if (err){
      throw err;
    }else{
      // first layer result --> finalResults,secondSeedIds
      var secondSeedIds = [];
      var thirdSeedIds  = [];

      console.log('seedid: %s',seedid);
      /** find secondSeedIds */
      for (var index in ans){
        if (ans[index].sourceId !== null && ans[index].targetId!== null){
          secondSeedIds.push(ans[index].sourceId.trim()); 
          secondSeedIds.push(ans[index].targetId.trim());          
        }

      }

      finalResults = finalResults.concat(ans);      
      secondSeedIds = secondSeedIds.filter(onlyUnique); // returns unique id, 
      /* remove seedid */
      var seedid_index = secondSeedIds.indexOf(seedid);
      if (~seedid_index) secondSeedIds.splice(seedid_index,1);
      console.log(secondSeedIds);
      

      /* second layer*/
      getCompanyRelation(secondSeedIds,function(err,ans2){
        if (err){
          throw err;
        }else{
          finalResults = finalResults.concat(ans2);
          res.send(finalResults);

        }
        // console.log(finalResults);
      });
    } 
  });
}

/**********************************************************/
/**取得公司資料*******************************************/
/*********************************************************/

function getCompanyAction(req,res){
  var id = req.params.id;
  console.log(id);
  getCompanyInfo(id,function(err,ans){
    if (err) throw err;
    res.send(ans);
  })
}


/******************************************************/
/** query help method ********************************/
/******************************************************/

/** 單層公司關係結構*/
function getCompanyRelation(seedid, mCallback){

  var request = new sql.Request(cp);
  var ans = [];

  async.parallel([
    function(callback){
      request.query(sqlOwn(seedid),function(err,data1){
        if(err) {
          console.log(err);
          callback(err, null);
          return;
        }
        // console.log(data1);
        // ans['test1'] = data1;
        ans.push.apply(ans,data1); // append to ans [{},{},...]
        callback(null,'own');
      });
    },
    function(callback){
      request.query(sqlBelong(seedid),function(err,data2){
        if(err) {
          console.log(err);
          callback(err, null);
          return;
        }
        // console.log(data2);
        // ans['test2'] = data2;
        ans.push.apply(ans,data2);        
        callback(null,'belong');
      });
    }
  ],
  function(err,results){
    console.log(results);
    mCallback(err, ans);
    // console.log(sqlOwn(['12863348','86517384']));
  });

}

/** 公司詳細資料 */ 


function getCompanyInfo(id,mCallback){
  var request = new sql.Request(cp);
  var ans = [];
  async.series(
    [
      function(callback){
        request.query(sqlCompanyInfo(id),function(err,data1){
          if (err){
            return callback(err,null);
          }
          ans = ans.concat(data1);
          callback(null,data1);
        });
      }
      ,
      function (callback){
        request.query(sqlCompanyDirectors(id),function(err,data2){
          if (err){
            return callback(err,null);
          }else{
            if (ans[0]!==undefined) ans[0]['董監事名單'] = data2;
            callback(null,data2);
          }
          
        })
      }
    ],function(err,results){
      console.log(results);
      mCallback(err,ans);
    }
  );
}


/***********************************/
/********* sql help method *********/
/***********************************/

function sqlOwn(seedid){
  if (seedid instanceof Array){
    seedid = seedid.join('\',\'');
  }
  var sql_own =
  `
  select a.ID targetId, a.公司名稱 target, b.所代表法人ID sourceId, b.所代表法人 source,count(*) value
  from
  公司法人資料 a
  left join 公司董監事 b
  on a.ID = b.ID
  where b.所代表法人ID in ('${seedid}')
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
  return sql_own;
}

function sqlBelong(seedid){
  if (seedid instanceof Array){
    seedid = seedid.join('\',\'');
  }
  var sql_temp =
  `
  select a.ID targetId ,a.公司名稱 target, b.所代表法人ID sourceId,b.所代表法人 source ,count(*) value
  from
  公司法人資料 a
  left join 公司董監事 b
  on a.ID = b.ID
  where a.ID in ('${seedid}')
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
  return sql_temp;
}

function sqlCompanyDirectors(seedid){

  var sql_director = 
  `select a.公司名稱,b.*
  from external.dbo.公司法人資料 a
    left join external.dbo.公司董監事 b
      on a.ID = b.ID
  where a.ID = '${seedid}' ` ;
  return sql_director;
}


function sqlCompanyInfo(seedid){

  var sql_company_info = 
  `
  select 公司名稱,公司所在地
  from 
  公司法人資料
  where ID = '${seedid}'
  `;
  return sql_company_info;
}


function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
