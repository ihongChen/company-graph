/** front-end d3js */
// get the data

var app = angular.module("companyGraph", []);



function MainCtrl($scope, $http){

  $scope.ID = "86517384";

  $scope.getGraph = function(ID){
    // var hostUrl = "http://localhost:5000/fakeGraph?id=86517384";
    var hostUrl = "http://localhost:5000/q" + "?id=" + ID;
    d3.json(hostUrl,function(err,links){
      var nodes = {};

      // Compute the distinct nodes from the links.

      links.forEach(function(link){
        // console.log(link.source);
        link.source = nodes[link.source] ||
        (nodes[link.source] = {name: link.source, id: link.sourceId});
        link.target = nodes[link.target] ||
        (nodes[link.target] = {name: link.target, id: link.targetId});
        link.value = +link.value;
      });
      console.log("nodes: " + JSON.stringify(nodes));
      // console.log(links);

      var width = 750,
          height = 500;

      var force = d3.layout.force()
                  .nodes(d3.values(nodes))
                  .gravity(.05)
                  .links(links)
                  .size([width,height])
                  .linkDistance(100)
                  .charge(-350)
                  .on('tick',tick)
                  .start();

      //******節點拖拉特效  ******//

      var drag = force.drag()
        .on("dragstart", dragstart);

      function dragstart(d){
        d3.select(this).classed("fixed",d.fixed=false);
      }

      var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

      function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
      }

      function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
      }

      function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
      }
      //*****************************//

      // set the range
      var v = d3.scale.linear().range([0, 100]);
      // Scale the range of the data
      v.domain([0, d3.max(links, function(d) { return d.value; })]);
      // asign a type per value to encode opacity
      links.forEach(function(link) {

        if (v(link.value) <= 25) {
          link.type = "twofive";
        } else if (v(link.value) <= 50 && v(link.value) > 25) {
          link.type = "fivezero";
        } else if (v(link.value) <= 75 && v(link.value) > 50) {
          link.type = "sevenfive";
        } else if (v(link.value) <= 100 && v(link.value) > 75) {
          link.type = "onezerozero";
        }
      });
      // remove svg if exist ...
      if (d3.select("svg") !== null){
        d3.select("svg").remove();
      }

      var svg = d3.select(".graphChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
      // build the arrow.
      svg.append("svg:defs").selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

      // add the links and the arrows
      var path = svg.append("svg:g").selectAll("path")
      .data(force.links())
      .enter().append("svg:path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", "url(#end)");

      // define the nodes
      var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .attr("id", function(d, i) { return (d.id); })
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", click)
      .on("dblclick", dblclick)
      .call(node_drag);



      // add the nodes
      node.append("circle")
      .attr("r", 5);

      // add the text
      node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });


      // add the curvy lines
      function tick() {
        path.attr("d", function(d) {
          var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
          return "M" +
          d.source.x + "," +
          d.source.y + "A" +
          dr + "," + dr + " 0 0,1 " +
          d.target.x + "," +
          d.target.y;
        });

        node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")"; });
      }


      // action to take on mouse click
      function click() {
        d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 22)
        .style("fill", "steelblue")
        .style("stroke", "lightsteelblue")
        .style("stroke-width", ".5px")
        .style("font", "20px sans-serif");
        d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16)
        .style("fill", "lightsteelblue");

        // 行內資訊查詢
        if (d3.select(".property") !== null){
          d3.select(".property").remove();
          }
        d3.select(".propertyChart")
           .append("div")
           // .style("width",500)
           // .style("height",300)
           .attr("class","property");


                // .style("opacity",0)
        console.log('this:'+JSON.stringify(this));
        var Company = this.__data__.name;
        console.log("Company :"+JSON.stringify(Company));
        $http.get("http://localhost:5000/property/"+this.id.trim())
              .then(function(response){
                console.log("response: " + JSON.stringify(response));
                console.log("response.data:"+ JSON.stringify(response.data));
                // div.html(respnose.data);
                console.log("response.data['台外幣總存款']:" + response.data[0]['台外幣總存款'] )
                if (response.data !== undefined){

                  var chart = c3.generate({
                    bindto: '.property',
                    padding: {
                              left: 100,
                              top : 10
                            },
                    data: {
                    x: 'x',
                    columns:
                          [
                            ['x', '台外幣總存款', '放款總餘額','最近一個月平均餘額',
                            '最近三個月平均餘額', '最近六個月平均餘額',
                            '最近一年平均餘額'],
                            // ['value',100,300]
                            [`元`, response.data[0]['台外幣總存款'],
                             response.data[0]['放款總餘額(L+PB+CK)'],
                             response.data[0]['最近一個月平均餘額(台外幣總存款)'],
                             response.data[0]['最近三個月平均餘額(台外幣總存款)'],
                             response.data[0]['最近六個月平均餘額(台外幣總存款)'],
                             response.data[0]['最近一年平均餘額(台外幣總存款)']
                             ]
                          ],
                    type: 'bar'
                    },
                    axis: {
                      rotated: true,
                      x: {
                        type: 'category'
                      }
                    }
                  }
                  );
                }

              })
              if (d3.select("#title") !== null){
                  d3.select("#title").remove();
                  }
              d3.select(".propertyChart").append("text")
                  .attr("id","title")
                  .attr("x", 100 )
                  .attr("y", 150)
                  .style("text-anchor", "middle")
                  .text(`${Company}`);
        }

        // Create Event Handlers for mouse
      function handleMouseOver(d, i) {  // Add interactivity

        // define div for tooltips
        var div = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);


        $http.get("http://localhost:5000/company/"+d.id)
              .then(function(response) {
               // console.log("response: "+JSON.stringify(response.data[0]));

                var company_data = companyToString(response.data[0]);

                  //
                console.log(JSON.stringify(company_data));

                div.transition()
                    .duration(100)
                    .style("opacity",.9);
                div.html("<h2>" + d.name + "(" + d.id +")" + "</h2>"
                          +"<h3>" +"董監事名單" + "</h3>"  + company_data[0])
                    .style("left", (d.x) + "px")
                    .style("top", (d.y - 28) + "px")
                    .style("width", "470px")
                    .style("height", (company_data[1]*18 + 100) +"px" );
                });

      }

      });

  }

  $scope.getGraph($scope.ID);
}


/**********************************************/
/***************輔助函數***********************/
/**********************************************/

/** event Handlers */

// // action to take on mouse click
// function click() {
//   d3.select(this).select("text").transition()
//   .duration(750)
//   .attr("x", 22)
//   .style("fill", "steelblue")
//   .style("stroke", "lightsteelblue")
//   .style("stroke-width", ".5px")
//   .style("font", "20px sans-serif");
//   d3.select(this).select("circle").transition()
//   .duration(750)
//   .attr("r", 16)
//   .style("fill", "lightsteelblue");
// }

// action to take on mouse double click
function dblclick() {
  d3.select(this).select("circle").transition()
  .duration(750)
  .attr("r", 6)
  .style("fill", "#ccc");
  d3.select(this).select("text").transition()
  .duration(750)
  .attr("x", 12)
  .style("stroke", "none")
  .style("fill", "black")
  .style("stroke", "none")
  .style("font", "10px sans-serif");
}

function handleMouseOut(d, i) {
  // Select text by id and then remove
  var idTag = "#t" + d.x + "-" + d.y + "-" + i;
  // console.log("idTag: "+idTag);
  //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
  d3.select(".tooltip").remove();  // Remove text location
}





/**輔助列印公司資訊 */


function companyToString(response){
  // console.log("json.stringify type:"+JSON.stringify(response));
  var pprint = "";
  for(var index in response['董監事名單']){
    var director = response['董監事名單'][index];
    var print =
      '姓名: '+ director['姓名'] + ', 職稱: ' + director['職稱'] + ', 所代表法人: ' +
      director['所代表法人'] + '(' + director['所代表法人ID'] +')' ;
    // console.log(print);
    pprint += print + "<br/>" ;
  }
  var height = pprint.split('<br/>').length;
  return [pprint , height]; //return pprint and 'height' of data
}
