
function CalcOffsets(node, in_use={}) {
    var to_remove = [];
    for (var num in in_use) {
        // console.log(num, in_use, in_use[num], node.data.origin_time);
        if (in_use[num] <= node.data.origin_time) {
            to_remove.push(num);
            // console.log("removing");
        }
    }

    for (var num in to_remove) {
        delete in_use[num];
    }

    for (var i of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8, 9, -9, 10, -10]) {
        if (!(i in in_use)) {
            break;
        }
    }
    // console.log(i, in_use);
    node.data.offset = i;
    in_use[i] = node.data.destruction_time;
    if (node.children === undefined || node.children.length > 1) {
        in_use = {};
    }

    for (var child in node.children) {
        let new_in_use = Object.assign({}, in_use);
        CalcOffsets(node.children[child], new_in_use);
    }
    // console.log(node);
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree
function Tree(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    label, // given a node d, returns the display name
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "#999", // fill for nodes
    fillOpacity, // fill opacity for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo
    haloWidth = 3, // padding around the labels
  } = {}) {

    var age_scale = d3.scalePow().exponent(10).domain([0,5000]).range([padding, width - 2*padding]);
    var color_scale = d3.scaleOrdinal(d3.schemeCategory10);
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

    // Compute labels and titles.
    const descendants = root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));

    // Sort the nodes.
    if (sort != null) root.sort(sort);

    // Compute the layout.
    const dx = 10;
    const dy = width / (root.height + padding);
    tree().nodeSize([dx, dy])(root);

    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
      //   console.log(d.y, d.data.origin_time, age_scale(d.data.origin_time));
      d.y = age_scale(d.data.origin_time);
    });

    CalcOffsets(root);

    // Compute the default height.
    if (height === undefined) height = x1 - x0 + dx * 2;

    const svg = d3.select("svg")
        .attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
        .attr("width", width)
        .attr("height", height)
        // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
      .selectAll("path")
        .data(root.links())
        .join("path")
          .attr("d", d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));

    const node = svg.append("g")
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("rect")
        .attr("height", 1)
        // .attr("height", function(d) {
        //     var end = d.data.destruction_time;
        //     if (isNaN(end)) {
        //         end = 5000;
        //     }
        //     return age_scale(end) - d.y;
        // })
        .attr("width", function(d) {
            var end = d.data.destruction_time;
            // if (isNaN(end)) {
            //     end = 5000;
            // }
            return age_scale(end) - d.y;
        })
        .style("fill-opacity", 0)
        .style("stroke-width", 1)
        .style("stroke", function(d){return color_scale(d.id);})
        // .attr("x", function(d) {return 1;});
        .attr("y", function(d){return d.data.offset*2;});

    node.append("circle")
        .attr("fill", fill)
        .attr("r", function(d){return d.data.destruction_time == 5000 ? 2 : 0;});


    if (title != null) node.append("title")
        .text(d => title(d.data, d));

    if (L) node.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text((d, i) => L[i])
        .call(text => text.clone(true))
        .attr("fill", "none")
        .attr("stroke", halo)
        .attr("stroke-width", haloWidth);

    return svg.node();
  }


// d3.csv("example.csv", function(data){
d3.csv("nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv",
  function(d) {
      return {
          id: d.id,
          parentId: d.ancestor_list == "[NONE]" ? null : JSON.parse(d.ancestor_list)[0],
          origin_time: +d.origin_time,
          destruction_time: isNaN(+d.destruction_time) ? 5000 : +d.destruction_time
      };
  }
).then(
    function(data) {
        var chart = Tree(data, {
            // id: function(d){return d.id},
            // parentId: function(d){
            //     if (d.ancestor_list == "[NONE]") {
            //         return null;
            //     }
            //     return JSON.parse(d.ancestor_list)[0];
            // },
            width: 2000,
            height: 2000,
            padding: 10,
            fill: "black"
        });

    }
);
