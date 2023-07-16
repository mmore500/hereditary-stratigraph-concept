import dendropy as dp

from ._load_dendropy_tree import load_dendropy_tree


def setup_dendropy_tree(path: str) -> dp.Tree:
    tree = load_dendropy_tree(path)

    for node in tree:
        node.edge.length = 1

    for idx, node in enumerate(tree.leaf_node_iter()):
        node.taxon = tree.taxon_namespace.new_taxon(label=str(idx))

    tree.update_bipartitions(
        suppress_unifurcations=False,
        collapse_unrooted_basal_bifurcation=False,
    )

    return tree
