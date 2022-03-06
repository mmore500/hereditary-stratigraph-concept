var selected = new Set();
var pairwise_data = new Map();
var age_scale;
var root;
var color_scale = d3.scaleOrdinal(d3.schemeCategory10);
var strokeWidth = 5;
var axis;
var axis_g;
var scale_range;

const svg = d3.select("svg");

function update_tree() {

    root.each(d => {
        d.y = age_scale(d.data.origin_time);
      });

      svg.selectAll(".phylo_path")
          .attr("d", d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));
  
    svg.selectAll("a")
        .attr("transform", d => `translate(${d.y},${d.x})`);
  
    svg.selectAll("rect")
        .attr("width", function(d) {
            var end = d.data.destruction_time;
            if (end == 5000) {
                extant[d.id] = d;
            }
            return age_scale(end) - d.y;
        })
        .attr("y", function(d){return (-.5 * strokeWidth) + d.data.offset*strokeWidth;});
    
    new_ticks = [age_scale.invert(scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.25 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.5 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.75 + scale_range[0]), age_scale.invert(scale_range[1])];
    axis.tickValues(new_ticks)
    axis_g.call(axis);
}

function update_age_scale(exponent) {
    age_scale.exponent(exponent);
    update_tree();

}

$("#exponent_slider").on("input change", function() {
    var e = $('#exponent_slider').val();
    update_age_scale(e); 
});

function handle_click(event, d) {
    var sel = d3.select(this);
    if (selected.has(d.id)) {
        sel.style("fill", "black")
        selected.delete(d.id);
        return;
    }

    if (selected.size >= 2) {
        d3.selectAll("circle").style("fill", "black");
        selected.clear();
    }

    sel.style("fill", "red")
    selected.add(d.id);

    if (selected.size == 2) {
        var iter = selected.keys();
        var k1 = iter.next().value;
        var k2 = iter.next().value;
        var mrca_info = pairwise_data.get(k1).get(k2);
        console.log(mrca_info);
        svg.selectAll("rect").data(mrca_info).append("rect")
           .attr("width", function(d) {return age_scale(d.upper_bound) - age_scale(d.lower_bound) + 1})
           .attr("x", function(d) {return age_scale(mrca_info.upper_bound);})
           .attr("y", 0)
           .attr("height", 2000);
    }
}


var extant = {};

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
    axis_space = 20
  } = {}) {
  
    age_scale = d3.scalePow().exponent(10).domain([0,5000]).range([padding, width - 2*padding]);
    scale_range = age_scale.range();
    axis = d3.axisTop(age_scale)
            //  .ticks(3);       
             .tickValues([0, 4000, 4500, 4750, 5000]);
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

    // Compute labels and titles.
    const descendants = root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));

    // Sort the nodes.
    if (sort != null) root.sort(sort);

    // Compute the layout.
    const dx = 10 + axis_space;
    const dy = width / (root.height + padding);
    // tree().nodeSize([dx, dy])(root);
    tree().size([height - 2*padding - axis_space, 1])(root);
    // tree()(root);

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
    if (height === undefined) height = x1 - x0 + dx * 2 + axis_space;
  
    svg.attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
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
              .y(d => d.x))
          .classed("phylo_path", true);
  
    const node = svg.append("g")
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("rect")
        .attr("height", strokeWidth)
        // .attr("height", function(d) {
        //     var end = d.data.destruction_time;
        //     if (isNaN(end)) {
        //         end = 5000;
        //     }
        //     return age_scale(end) - d.y;
        // })
        .attr("width", function(d) {
            var end = d.data.destruction_time;
            if (end == 5000) {
                extant[d.id] = d;
            }
            return age_scale(end) - d.y;
        })
        .style("fill-opacity", 1)
        .style("stroke-width", .1)
        .style("fill", function(d){return color_scale(d.id);})
        .style("stroke", function(d){return color_scale(d.id);})
        // .attr("x", function(d) {return 1;});
        .attr("y", function(d){return (-.5 * strokeWidth) + d.data.offset*strokeWidth;});

    node.append("circle")
        .attr("fill", fill)
        .attr("r", function(d){return d.data.destruction_time == 5000 ? 2 : 0;})
        .on("click", handle_click);


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
    // console.log(extant);

    axis_g = svg.append("g")
       .attr("transform", "translate(0,"+ (x0 - dx + axis_space) + ")")
       .call(axis);

    svg.append("text")
        .attr("transform", "translate(" + width/2 + ","+ (x0 - dx + axis_space) + ")")
        .attr("dy", "-2em")
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .text("Time");

    return svg.node();
  }

d3.csv("../data/osfstorage/phylogenetic-inference/simulated-pairwise-mrca-estimates/a=pairwise_mrca_estimates+source=osf-nk-randomselection-seed7-pop100-mut-01-snapshot-5000-csv", function(row) {
    return {
        from: row["Taxon Compared From"],
        to: row["Taxon Compared To"],
        lower_bound: +row["Generation Of MRCA Lower Bound (inclusive)"],
        upper_bound: +row["Generation Of MRCA Upper Bound (exclusive)"],
        confidence: +row["MRCA Bound Confidence"]
    };
}).then(
    function(data){
        console.log("loaded");
        for (var row of data) {
            if (!pairwise_data.has(row.from)) {
                // console.log(row);
                pairwise_data.set(row.from, new Map([[row.to, [row]]]));
            } else {
                if (!pairwise_data.get(row.from).has(row.to)) {
                    pairwise_data.get(row.from).set(row.to, [row]);
                } else {
                    pairwise_data.get(row.from).get(row.to).push(row);
                }
            }
            if (!pairwise_data.has(row.to)) {
                // console.log(row);
                pairwise_data.set(row.to, new Map([[row.from, [row]]]));
            } else {
                if (!pairwise_data.get(row.to).has(row.from)) {
                    pairwise_data.get(row.to).set(row.from, [row]);
                } else {
                    pairwise_data.get(row.to).get(row.from).push(row);
                }
            }
        }
    }
).then( function(orig_data) {
    // d3.csv("example.csv", function(data){
    // https://files.osf.io/v1/resources/4sm72/providers/osfstorage/6218eef419ba8b044ae128ba
    d3.csv("../data/osfstorage/phylogenetic-inference/template-phylogenies/nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv",
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
            // console.log(pairwise_data);
            var chart = Tree(data, {
                // id: function(d){return d.id},
                // parentId: function(d){
                //     if (d.ancestor_list == "[NONE]") {
                //         return null;
                //     }
                //     return JSON.parse(d.ancestor_list)[0];
                // },
                width: 1500,
                height: 800,
                padding: 10,
                fill: "black",
                axis_space: 40,
                strokeWidth: strokeWidth
            });

        }
    );
});

