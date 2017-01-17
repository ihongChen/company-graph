// query company-relation for a given seedid
var async = require('async');

module.exports = {
  getGraph:getGraphAction
}

function getGraphAction(req,res){
  console.log('query db');

  var query = req.query;
  var seedid = query.id;
  // console.log(sqlOwn(seedid));
  getCompanyRelation(seedid,function(err,result){
    res.send(result);
  })
  // pool.query(sqlBelong(seedid),function(err,data){
  //   if (err){
  //     throw err;
  //   }else{
  //     res.send(data);
  //   }
  // });

}

/**query help function*/
function getCompanyRelation(seedid, mCallback){

  var ans = [];

  async.parallel([
    function(callback){
      pool.query(sqlOwn(seedid),function(err,data1){
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
      pool.query(sqlBelong(seedid),function(err,data2){
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
    console.log(sqlOwn(['86517384','1111111']));
    mCallback(err, ans);
  });

}





/** sql help method */
function sqlOwn(seedid){
  if (typeof(seedid)==='object'){
    seedid = seedid.toString();
  }
  var sql_own =
  `
  select a.ID, a.公司名稱 target, b.所代表法人ID, b.所代表法人 source,count(*) value
  from
  公司法人資料 a
  left join 公司董監事 b
  on a.ID = b.ID
  where b.所代表法人ID in ('${seedid}')
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
  return sql_own
}

function sqlBelong(seedid){
  var sql_temp =
  `
  select a.ID ,a.公司名稱 target, b.所代表法人ID,b.所代表法人 source ,count(*) value
  from
  公司法人資料 a
  left join 公司董監事 b
  on a.ID = b.ID
  where a.ID = '${seedid}'
  group by a.ID,a.公司名稱,b.所代表法人 ,b.所代表法人ID
  `;
  return sql_temp
}

/** */
