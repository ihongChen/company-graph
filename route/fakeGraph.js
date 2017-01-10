

module.exports = {
  getGraph: getGraphAction,
  getCompany : getCompanyAction
}


function getGraphAction(req,res){

  var query = req.query;
  var seedid = query.id; //seedid
  var finalResults = [
  {
    "sourceId":"86517384",
    "source":"永豐銀行",
    "target":"永豐金財產保險人公司",
    "targetId":"23456771",
    "value":"1"
  },
  {
    "source":"永豐銀行",
    "sourceId":"86517384",
    "target":"永豐金哇溪瞎咪哇高公司",
    "targetId":"341414123",
    "value":"2"
  },
  {
    "source":"永豐銀行",
    "sourceId":"86517384",
    "target":"哇掰不出來公司",
    "targetId":"123412141",
    "value":3
  },
  {
    "source":"永豐金控",
    "sourceId":"41414141",
    "target":"永豐銀行",
    "targetId":"86517384",
    "value":10
  }
];


  res.send(finalResults);
}

function getCompanyAction(req, res){
  var id = req.params.id;
  console.log("id: "+id);
  var finalResults = {
    "ID": "86517384",
    "ADD": "台北市天龍路四段222巷14號",
    "SETUP": "2017-01-01",
    "STATUS": "核准成立",
    "OWNERS": [
      {
        "NAME": "陳一宏",
        "TITLE": "董事長",
        "SHAREHOLD": "100000000"
      },
      {
        "NAME": "陳二宏",
        "TITLE": "董事",
        "SHAREHOLD": "200000000"
      }
    ]
  };

  res.send(finalResults);
}
