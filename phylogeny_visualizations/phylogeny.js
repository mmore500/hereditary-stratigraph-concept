var selected = new Set();
var pairwise_data = new Map();
var age_scale;
var root;
var color_scale = d3.scaleOrdinal(d3.schemeCategory10);
var strokeWidth = 5;
var axis;
var axis_g;
var scale_range;
var estimate = "RecencyProportionalResolution164";
var pairwise_file = "a=pairwise_mrca_estimates+source=nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
var phylo_file = "nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
var max_update = 5000;
var rect_opacity = 1;

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

    svg.selectAll(".taxon_rect")
        .attr("width", function(d) {
            return age_scale(d.data.destruction_time) - d.y;
        })
        .attr("y", function(d){return (-.5 * strokeWidth) + d.data.offset*strokeWidth;});

    new_ticks = [age_scale.invert(scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.25 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.5 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.75 + scale_range[0]), age_scale.invert(scale_range[1])];
    axis.tickValues(new_ticks)
    axis_g.call(axis);
    if (selected.size == 2) {
        update_conf_int();
    }

}

function update_age_scale(exponent) {
    age_scale.exponent(exponent);
    update_tree();

}

function update_conf_int() {
    var iter = selected.keys();
    var k1 = iter.next().value;
    var k2 = iter.next().value;
    var mrca_info = pairwise_data.get(k1).get(k2);
    console.log(mrca_info.get(estimate));
    svg.selectAll(".conf_int")
       .data([mrca_info.get(estimate)])
       .join("rect")
       .classed("conf_int", true)
       .attr("width", function(d) {return age_scale(d.upper_bound) - age_scale(d.lower_bound) + 1})
       .attr("x", function(d) {return age_scale(d.lower_bound);})
       .attr("y", 0)
       .attr("height", 2000)
       .style("fill", "yellow")
       .style("fill-opacity", .2);

    svg.selectAll(".conf_int_border")
       .data([mrca_info.get(estimate)])
       .join("rect")
       .classed("conf_int_border", true)
       .attr("width", 1)
       .attr("x", function(d) {return age_scale(d.upper_bound);})
       .attr("y", 0)
       .attr("height", 2000)
       .style("fill", "black")
       .style("fill-opacity", 1);
}

function get_curr_policy() {
    var pol = $('#retention_policy_select').val();
    var diff = $('#differentia_select').val();
    var target = $('#target_bits_select').val();
    estimate = pol+diff+target;
}

get_curr_policy();

$("#exponent_slider").on("input change", function() {
    var e = $('#exponent_slider').val();
    update_age_scale(e);
});

$(".policy_control").on("input change", function() {
    get_curr_policy();
    update_conf_int();
});

function set_rect_opacity() {
    var checked = document.querySelector(`#show_rects`).checked;
    if (checked) {
        rect_opacity = 1;
    } else {
        rect_opacity = 0;
    }
}

$("#show_rects").on("input change", function() {
    set_rect_opacity();

    d3.selectAll(".taxon_rect")
      .style("fill-opacity", rect_opacity)
      .style("stroke-width", rect_opacity*.1);
});
set_rect_opacity();

function set_files() {
    var choice = $('#example_phylogeny_select').val();
    if (choice == "random") {
        pairwise_file = "a=pairwise_mrca_estimates+source=nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";                
        max_update = 5000;
    } else if (choice == "tournament") {
        pairwise_file = "a=pairwise_mrca_estimates+source=nk_tournamentselection_seed140_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_tournamentselection_seed140_pop100_mut.01_snapshot_5000.csv";                
        max_update = 5000;
    } else if (choice == "lexicase") {
        pairwise_file = "a=pairwise_mrca_estimates+source=nk_lexicaseselection_seed110_pop165_mut.01_snapshot_500.csv";
        phylo_file = "nk_lexicaseselection_seed110_pop165_mut.01_snapshot_500.csv";                
        max_update = 500;
    } else if (choice == "sharing") {
        pairwise_file = "a=pairwise_mrca_estimates+source=nk_sharingselection_seed10_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_sharingselection_seed10_pop100_mut.01_snapshot_5000.csv";                        
        max_update = 5000;
    }
}

$("#example_phylogeny_select").on("input", function() {
    set_files();
    load_data();
});

function handle_click(event, d) {
    console.log(d);
    var sel = d3.select(this);
    if (selected.has(d.id)) {
        sel.style("fill", "black")
           .attr("r", function(d){return d.data.destruction_time == max_update ? 3 : 0;});

        selected.delete(d.id);
        return;
    }

    if (selected.size >= 2) {
        d3.selectAll("circle")
          .style("fill", "black")
          .attr("r", function(d){return d.data.destruction_time == max_update ? 3 : 0;});
        selected.clear();
    }

    sel.style("fill", "red")
       .attr("r", 7);
    selected.add(d.id);

    if (selected.size == 2) {
        update_conf_int();
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
    extant = {};
    var e = $('#exponent_slider').val();
    age_scale = d3.scalePow().exponent(e).domain([0,max_update]).range([padding, width - 2*padding]);
    scale_range = age_scale.range();
    new_ticks = [age_scale.invert(scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.25 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.5 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.75 + scale_range[0]), age_scale.invert(scale_range[1])];
    axis = d3.axisTop(age_scale)
            //  .ticks(3);
             .tickValues(new_ticks);
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
    console.log(root.height);
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
            // if (end == max_update) {
            //     extant[d.id] = d;
            // }
            return age_scale(end) - d.y;
        })
        .classed("taxon_rect", true)
        .style("fill-opacity", rect_opacity)
        .style("stroke-width", .1)
        .style("fill", function(d){return color_scale(d.id);})
        .style("stroke", function(d){return color_scale(d.id);})
        // .attr("x", function(d) {return 1;});
        .attr("y", function(d){return (-.5 * strokeWidth) + d.data.offset*strokeWidth;});

    node.append("circle")
        .attr("fill", fill)
        .attr("r", function(d){return d.data.destruction_time == max_update ? 3 : 0;})
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

function load_data() {
    svg.selectAll("*").remove();   

    set_files();

    d3.csv(pairwise_file, function(row) {
        return {
            from: row["Taxon Compared From"],
            to: row["Taxon Compared To"],
            lower_bound: +row["Generation Of MRCA Lower Bound (inclusive)"],
            upper_bound: +row["Generation Of MRCA Upper Bound (exclusive)"],
            confidence: +row["MRCA Bound Confidence"],
            config: row["Column Configuration"],
            differentia: row["Differentia Bit Width"],
            policy: row["Stratum Retention Policy"],
            target_bits: row["Stratigraphic Column Target Retained Bits"]
        };
    }).then(
        function(data){
            // console.log("loaded");
            for (var row of data) {
                var config_key = row.policy + row.differentia + row.target_bits;
                if (!pairwise_data.has(row.from)) {
                    // console.log(row);
                    pairwise_data.set(row.from, new Map([[row.to, new Map([[config_key, row]])]]));
                } else {
                    if (!pairwise_data.get(row.from).has(row.to)) {
                        pairwise_data.get(row.from).set(row.to, new Map([[config_key, row]]));
                    } else {
                        pairwise_data.get(row.from).get(row.to).set(config_key, row);
                    }
                }
                if (!pairwise_data.has(row.to)) {
                    // console.log(row);
                    pairwise_data.set(row.to, new Map([[row.from, new Map([[config_key, row]])]]));
                } else {
                    if (!pairwise_data.get(row.to).has(row.from)) {
                        pairwise_data.get(row.to).set(row.from, new Map([[config_key, row]]));
                    } else {
                        pairwise_data.get(row.to).get(row.from).set(config_key, row);
                    }
                }
            }
        }
    ).then( function(orig_data) {
        // d3.csv("example.csv", function(data){
        // 
        // d3.csv("https://files.osf.io/v1/resources/4sm72/providers/osfstorage/6218eef419ba8b044ae128ba",
        d3.csv(phylo_file,
        function(d) {
            return {
                id: d.id,
                parentId: d.ancestor_list == "[NONE]" ? null : JSON.parse(d.ancestor_list)[0],
                origin_time: +d.origin_time,
                destruction_time: isNaN(+d.destruction_time) ? max_update : +d.destruction_time
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
}

load_data();