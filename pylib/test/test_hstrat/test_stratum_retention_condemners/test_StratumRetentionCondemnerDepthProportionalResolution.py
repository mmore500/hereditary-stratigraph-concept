from copy import deepcopy
import unittest

from pylib import hstrat


class TestStratumRetentionCondemnerDepthProportionalResolution(
    unittest.TestCase,
):

    # tests can run independently
    _multiprocess_can_split_ = True

    def test_equality(self):
        assert (
            hstrat.StratumRetentionCondemnerDepthProportionalResolution()
            == hstrat.StratumRetentionCondemnerDepthProportionalResolution()
        )

        original \
            = hstrat.StratumRetentionCondemnerDepthProportionalResolution()
        copy = deepcopy(original)
        assert original == copy

    def _do_test_retention(
        self,
        guaranteed_depth_proportional_resolution,
    ):
        control_column = hstrat.HereditaryStratigraphicColumn(
            stratum_ordered_store_factory
                =hstrat.HereditaryStratumOrderedStoreDict,
            stratum_retention_predicate
                =hstrat.StratumRetentionPredicateDepthProportionalResolution(
                    guaranteed_depth_proportional_resolution
                        =guaranteed_depth_proportional_resolution,
                ),
        )
        test_column = hstrat.HereditaryStratigraphicColumn(
            stratum_ordered_store_factory
                =hstrat.HereditaryStratumOrderedStoreDict,
            stratum_retention_condemner
                =hstrat.StratumRetentionCondemnerDepthProportionalResolution(
                    guaranteed_depth_proportional_resolution
                        =guaranteed_depth_proportional_resolution,
                ),
        )

        for i in range(1000):
            control_column.DepositStratum()
            test_column.DepositStratum()
            d1, d2 = control_column.DiffRetainedRanks(test_column)
            assert d1 == set() and d2 == set(), (
                i,
                guaranteed_depth_proportional_resolution,
            )

    def test_retention(self):
        for guaranteed_depth_proportional_resolution in [
            1,
            2,
            3,
            7,
            42,
            100,
        ]:
            self._do_test_retention(
                guaranteed_depth_proportional_resolution,
            )

    def _do_test_CalcRankAtColumnIndex(
        self,
        guaranteed_depth_proportional_resolution,
    ):
        test_condemner \
            = hstrat.StratumRetentionCondemnerDepthProportionalResolution(
                guaranteed_depth_proportional_resolution
                    =guaranteed_depth_proportional_resolution,
            )
        test_column = hstrat.HereditaryStratigraphicColumn(
            always_store_rank_in_stratum=True,
            stratum_ordered_store_factory
                =hstrat.HereditaryStratumOrderedStoreDict,
            stratum_retention_condemner=test_condemner,
        )

        for i in range(10000):
            test_column.DepositStratum()
            actual_ranks = { *test_column.GetRetainedRanks() }
            calcualted_ranks = {
                test_condemner.CalcRankAtColumnIndex(
                    index=i,
                    num_strata_deposited=test_column.GetNumStrataDeposited()
                )
                for i in range(test_column.GetNumStrataRetained())
            }
            assert actual_ranks == calcualted_ranks
            # in-progress deposition case
            assert test_condemner.CalcRankAtColumnIndex(
                index=test_column.GetNumStrataRetained(),
                num_strata_deposited=test_column.GetNumStrataDeposited(),
            ) == test_column.GetNumStrataDeposited()

    def test_CalcRankAtColumnIndex(self):
        for guaranteed_depth_proportional_resolution in [
            1,
            2,
            3,
            7,
            42,
            100,
        ]:
            self._do_test_CalcRankAtColumnIndex(
                guaranteed_depth_proportional_resolution,
            )


if __name__ == '__main__':
    unittest.main()