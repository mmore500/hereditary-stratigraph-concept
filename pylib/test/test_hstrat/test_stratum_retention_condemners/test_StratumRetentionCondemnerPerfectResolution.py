from copy import deepcopy
import unittest

from pylib import hstrat


class TestStratumRetentionCondemnerPerfectResolution(unittest.TestCase):

    # tests can run independently
    _multiprocess_can_split_ = True

    def test_equality(self):
        assert (
            hstrat.StratumRetentionCondemnerPerfectResolution()
            == hstrat.StratumRetentionCondemnerPerfectResolution()
        )

        original = hstrat.StratumRetentionCondemnerPerfectResolution()
        copy = deepcopy(original)
        assert original == copy

    def test_condemnation(self):
        maximal_retention_condemner \
            = hstrat.StratumRetentionCondemnerPerfectResolution()
        for i in range(100):
            assert list(maximal_retention_condemner(
                retained_ranks=range(i),
                num_strata_deposited=i,
            )) == []


if __name__ == '__main__':
    unittest.main()