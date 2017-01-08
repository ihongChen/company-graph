var async = require('async');
var sql = require('mssql');


module.exports = {
  getGraph: getGraphAction
}


function getGraphAction(req,res){

  var query = req.query;
  var seedid = query.id; //seedid

  if (seedid!=null){
    // seedid持有
    var sql_q1_own = sqlOwn(seedid);
    // seedid被持有
    var sql_q1_belong = sqlBelong(seedid);
  }else{
    console.log('not valid query...');
    return;
  }

  var seedIds = [];
  seedIds.push(seedid);

  var finalResults = [];

  //first level
  getCompanyRelation(seedIds, function(err, ansResults){
    var secondSeedIds = [];
    for (var index in ansResults){
      secondSeedIds.push(ansResults[index].sourceId);
      secondSeedIds.push(ansResults[index].targetId);
    }
    finalResults.push(ansResults);

    //second level
    getCompanyRelation(secondSeedIds, function(err, ansResults2){
        finalResults.push(ansResults2);

        res.send(finalResults);
    });
  });


}


/** query help method */
function getCompanyRelation(seedIds, mCallback){

  var request = new sql.Request();
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
        ans.push.apply(ans,data2)
        callback(null,'two');
      });
    }
  ],
  function(err,results){
    console.log(results);
    mCallback(err, ans);
    console.log(sqlOwn(['12863348','86517384']));
  });

}

/** sql help method */
function sqlOwn(seedid){
  if (typeof(seedid)==='object'){
    seedid = seedid.toString();
  }
  var sql_own =
  `
  select a.ID, a.公司名稱 , b.所代表法人ID, b.所代表法人,count(*) value
  from
  dbo.公司法人資料 a
  left join dbo.公司董監事 b
  on a.ID = b.ID
  where b.所代表法人ID = '${seedid}'
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
}
  return sql_own
}

function sqlBelong(seedid){
  if (typeof(seedid)==='object'){
    seedid = seedid.toString();
  }
  var sql_temp =
  `
  select a.ID,a.公司名稱  , b.所代表法人ID,b.所代表法人  ,count(*) value
  from
  dbo.公司法人資料 a
  left join dbo.公司董監事 b
  on a.ID = b.ID
  where a.ID in ('${seedid}')
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
  return sql_temp
}
