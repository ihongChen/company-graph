/** front-end d3js */
// get the data
var app = angular.module("companyGraph", []); //

function MainCtrl($scope, $http){

  $scope.ID = "86517384";

  $scope.getGraph = function(ID){
    var hostUrl = "http://localhost:5000/fakeGraph?id=86517384";
    //var hostUrl = "http://localhost:5000/q" + "?id=" + ID;
    d3.json(hostUrl,function(err,links){
      var nodes = {};

      // Compute the distinct nodes from the links.
      links.forEach(function(link){
        // console.log(link.source);
        // var link_prev
        link.source = nodes[link.source] ||
        (nodes[link.source] = {name: link.source, id: link.sourceId});
        link.target = nodes[link.target] ||
        (nodes[link.target] = {name: link.target, id: link.targetId});
        link.value = +link.value;
      });
      console.log("nodes: " + JSON.stringify(nodes));
      // console.log(links);
      var width = 960,
      height = 500
      var force = d3.layout.force()
                  .nodes(d3.values(nodes))
                  .links(links)
                  .size([width,height])
                  .linkDistance(100)
                  .charge(-500)
                  .on('tick',tick)
                  .start();
      // set the range
      var v = d3.scale.linear().range([0, 100]);
      // Scale the range of the data
      v.domain([0, d3.max(links, function(d) { return d.value; })]);
      // asign a type per value to encode opacity
      links.forEach(function(link) {
        // console.log(v(link.value));
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

      if (d3.select("svg") !== null){
        d3.select("svg").remove();
      }

      var svg = d3.select("body")
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
      .call(force.drag);

      //TODO:FOR TEST
      console.log("force.nodes: "+JSON.stringify(force.nodes()));

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

        // Create Event Handlers for mouse
        function handleMouseOver(d, i) {  // Add interactivity
          // Specify where to put label of text
          svg.append("text").attr({
            class: "newtag",
            id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
            x: function() { return d.x - 30; },
            y: function() { return d.y - 15; }
          })
          .text(function() {
            return [d.id, d.name];  // Value of the text
          });

          getCompany($http, d.id);
        }

      });

  }

  $scope.getGraph($scope.ID);
}

/** event Handlers */
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
}

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
  console.log("idTag: "+idTag);
  //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
  d3.select(".newtag").remove();  // Remove text location
}

//http request
function getCompany($http, id){
  $http.get("http://localhost:5000/company/"+id)
  .then(function(response) {
    console.log("response: "+JSON.stringify(response));
    d3.select(".newtag").text(companyToString(response.data));
  });
}

//help method
function companyToString(response){
  var print = "";
  for(var index in response) {
    if (response.hasOwnProperty(index)) {
      var value = response[index];
      print += index + " : " + value + "<br/>";
    }
  }
  return print;
}
