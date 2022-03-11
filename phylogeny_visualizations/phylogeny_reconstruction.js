var selected = new Set();
var pairwise_data = new Map();
var age_scale;
var phylo_root;
var reconst_root;
var colors = [];
var ncolors = 15;
for (var i = 0; i < ncolors; i++) {
    colors.push(d3.interpolateRainbow(i/ncolors));
}

var color_scale = d3.scaleOrdinal(colors);
var strokeWidth = 5;
var axis_phylo;
var axis_g_phylo;
var axis_reconst;
var axis_g_reconst;
var scale_range;
var estimate = "RecencyProportionalResolution164";
var reconstructed_file = "https://raw.githubusercontent.com/mmore500/hereditary-stratigraph-concept/9b2720368c2310ab6c718da31fee49a873758a06/binder/phylogenetic-inference/a=pairwise_mrca_estimates+source=nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
var phylo_file = "nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
var max_update = 5000;
var rect_opacity = 1;

var all_reconstructions;

const phylo_svg = d3.select("#phylo_canvas");
const reconstruct_svg = d3.select("#reconstruct_canvas");

function update_tree() {

    phylo_root.each(d => {
        d.y = age_scale(d.data.origin_time);
    });

    reconst_root.each(d => {
        d.y = age_scale(d.data.origin_time);
    });


    d3.selectAll(".phylo_path")
       .attr("d", d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));

    phylo_svg.selectAll("a")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    reconstruct_svg.selectAll("a")
        .attr("transform", d => `translate(${d.y},${d.x})`);


    new_ticks = [age_scale.invert(scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.25 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.5 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.75 + scale_range[0]), age_scale.invert(scale_range[1])];
    axis_phylo.tickValues(new_ticks)
    axis_g_phylo.call(axis);

    axis_reconst.tickValues(new_ticks)
    axis_g_reconst.call(axis);
}

function update_age_scale(exponent) {
    age_scale.exponent(exponent);
    update_tree();

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


function set_files() {
    var choice = $('#example_phylogeny_select').val();
    if (choice == "random") {
        reconstructed_file = "https://raw.githubusercontent.com/mmore500/hereditary-stratigraph-concept/9b2720368c2310ab6c718da31fee49a873758a06/binder/phylogenetic-inference/a=reconstructed_phylogenies+source=nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_randomselection_seed7_pop100_mut.01_snapshot_5000.csv";                
        max_update = 5000;
    } else if (choice == "tournament") {
        reconstructed_file = "https://raw.githubusercontent.com/mmore500/hereditary-stratigraph-concept/9b2720368c2310ab6c718da31fee49a873758a06/binder/phylogenetic-inference/a=reconstructed_phylogenies+source=nk_tournamentselection_seed140_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_tournamentselection_seed140_pop100_mut.01_snapshot_5000.csv";                
        max_update = 5000;
    } else if (choice == "lexicase") {
        reconstructed_file = "https://raw.githubusercontent.com/mmore500/hereditary-stratigraph-concept/9b2720368c2310ab6c718da31fee49a873758a06/binder/phylogenetic-inference/a=pairwise_mrca_estimates+source=nk_lexicaseselection_seed110_pop165_mut.01_snapshot_500.csv";
        phylo_file = "nk_lexicaseselection_seed110_pop165_mut.01_snapshot_500.csv";                
        max_update = 500;
    } else if (choice == "sharing") {
        reconstructed_file = "https://raw.githubusercontent.com/mmore500/hereditary-stratigraph-concept/9b2720368c2310ab6c718da31fee49a873758a06/binder/phylogenetic-inference/a=reconstructed_phylogenies+source=nk_sharingselection_seed10_pop100_mut.01_snapshot_5000.csv";
        phylo_file = "nk_sharingselection_seed10_pop100_mut.01_snapshot_5000.csv";                        
        max_update = 5000;
    }
}

$("#example_phylogeny_select").on("input", function() {
    set_files();
    load_data();
});


var extant = {};

function AssignSortLabels(curr) {

    var parents = [];
    for (node of curr) {
        if (node.children === undefined) {
            node.max_descendant = node.data.label_name;
        } else {
            node.max_descendant = d3.max(node.children, function(d){return d.max_descendant;});
        }
        if (node.parent != null) {
            parents.push(node.parent);
        }
    }

    if (parents.length > 0) {
        AssignSortLabels(parents);
    }
}

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

function handle_click(e, d) {
    console.log(e, d);
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
    sort = (a, b) => {console.log(a, b); return d3.descending(a.label_name, b.label_name);}, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    label = function(data, d){return data.label_name.includes("Inner") ? "" : data.label_name;}, // given a node d, returns the display label_name
    title = function(d){return d.label_name;}, // given a node d, returns its hover text
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
    strokeOpacity = 1, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo
    haloWidth = 3, // padding around the labels
    axis_space = 20,
    svg_id = ""
  } = {}) {
    svg = d3.select(svg_id);
    extant = {};
    var e = $('#exponent_slider').val();
    age_scale = d3.scalePow().exponent(e).domain([0,max_update]).range([padding, width - 2*padding]);
    scale_range = age_scale.range();
    new_ticks = [age_scale.invert(scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.25 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.5 + scale_range[0]), age_scale.invert((scale_range[1] - scale_range[0])*.75 + scale_range[0]), age_scale.invert(scale_range[1])];
    axis = d3.axisTop(age_scale)
             .tickValues(new_ticks);
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

    AssignSortLabels(root.leaves());
    // Sort the nodes.
    root.sort(function(a, b){return d3.ascending(a.max_descendant,b.max_descendant);});

    // Compute labels and titles.
    const descendants = root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));


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

    svg.attr("viewBox", [0, x0 - dx, width, height])
        .attr("width", width)
        .attr("height", height)
        // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    svg.append("g")
        .attr("fill", "none")
        // .attr("stroke", stroke)
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
          .classed("phylo_path", true)
          .attr("stroke", function(d){return color_scale(+d.target.max_descendant);});

    const node = svg.append("g")
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("fill", function(d){return color_scale(+d.max_descendant);})
        .attr("r", function(d){return d.data.destruction_time == max_update && !d.children && !d.data.label_name.includes("Inner") ? 5 : 0;})
        .on("click", handle_click);


    if (title != null) node.append("title")
        .text(d => title(d.data, d));

    if (L) node.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text((d, i) => d.children ? "" : L[i])
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

    if (svg_id == "#reconstruct_canvas") {
        axis_reconst = axis;
        axis_g_reconst = axis_g;
    } else {
        axis_phylo = axis;
        axis_g_phylo = axis_g;        
    }

    return root;
  }

function load_data() {
    phylo_svg.selectAll("*").remove();   
    reconstruct_svg.selectAll("*").remove();   

    set_files();

    d3.csv(reconstructed_file, function(d) {
        return {
            id: d.id,
            label_name: d.name,
            parentId: d.ancestor_list == "[None]" ? null : JSON.parse(d.ancestor_list)[0],
            origin_time: +d.origin_time,
            destruction_time: isNaN(+d.destruction_time) ? max_update : +d.destruction_time,
            treatment: d.Treatment
        };
    }).then(

        function(data) {
            all_reconstructions = data;
            var filtered = d3.filter(data, function(d) {return d.treatment == "differentia=64+policy=RecencyProportionalResolution+target=4096";});

            // console.log(pairwise_data);
            reconst_root = Tree(filtered, {
                // id: function(d){return d.id},
                // parentId: function(d){
                //     if (d.ancestor_list == "[NONE]") {
                //         return null;
                //     }
                //     return JSON.parse(d.ancestor_list)[0];
                // },
                width: 1500,
                height: 1200,
                padding: 50,
                fill: "black",
                axis_space: 40,
                strokeWidth: strokeWidth,
                svg_id: "#reconstruct_canvas",
                sort: function(a, b) {console.log(a.label_name, b.label_name, d3.descending(a.label_name, b.label_name)); return d3.descending(a.label_name, b.label_name);}                
            });

        }
    ).then( function(orig_data) {
        // d3.csv("example.csv", function(data){
        // 
        // d3.csv("https://files.osf.io/v1/resources/4sm72/providers/osfstorage/6218eef419ba8b044ae128ba",
        d3.csv(phylo_file,
        function(d) {
            return {
                id: d.id,
                label_name: d.id,
                parentId: d.ancestor_list == "[NONE]" ? null : JSON.parse(d.ancestor_list)[0],
                origin_time: +d.origin_time,
                destruction_time: isNaN(+d.destruction_time) ? max_update : +d.destruction_time
            };
        }
        ).then(
            function(data) {
                // console.log(pairwise_data);
                phylo_root = Tree(data, {
                    // id: function(d){return d.id},
                    // parentId: function(d){
                    //     if (d.ancestor_list == "[NONE]") {
                    //         return null;
                    //     }
                    //     return JSON.parse(d.ancestor_list)[0];
                    // },
                    width: 1500,
                    height: 1200,
                    padding: 50,
                    fill: "black",
                    axis_space: 40,
                    strokeWidth: strokeWidth,
                    svg_id: "#phylo_canvas",
                    sort: (a, b) => d3.descending(a.label_name, b.label_name)
                });

            }
        );
    });
}

load_data();