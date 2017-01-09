var async = require('async');
var sql = require('mssql');


module.exports = {
  getGraph: getGraphAction
}


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


  /***/
  getCompanyRelation(seedid,function(err,ans){
    if (err){
      throw err;
    }else{
      // first layer result --> finalResults,secondSeedIds
      var secondSeedIds = [];
      for (var index in ans){
        secondSeedIds.push(ans[index].sourceId.trim()); 
        secondSeedIds.push(ans[index].targetId.trim());
      }

      finalResults = finalResults.concat(ans);
      secondSeedIds = secondSeedIds.filter(onlyUnique); // returns unique id, 
      /* remove seedid */
      var seedid_index = secondSeedIds.indexOf(seedid);
      if (~seedid_index) secondSeedIds.splice(seedid_index,1);
      console.log(secondSeedIds);
      // console.log(finalResults);

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


/** query help method */
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
        callback(null,'one');
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
        callback(null,'two');
      });
    }
  ],
  function(err,results){
    console.log(results);
    mCallback(err, ans);
    // console.log(sqlOwn(['12863348','86517384']));
  });

}


/** sql help method */
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

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
