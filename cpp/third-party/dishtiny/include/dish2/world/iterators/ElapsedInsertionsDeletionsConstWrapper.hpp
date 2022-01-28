#pragma once
#ifndef DISH2_WORLD_ITERATORS_ELAPSEDINSERTIONSDELETIONSCONSTWRAPPER_HPP_INCLUDE
#define DISH2_WORLD_ITERATORS_ELAPSEDINSERTIONSDELETIONSCONSTWRAPPER_HPP_INCLUDE

#include <type_traits>

#include "../../../../third-party/Empirical/include/emp/base/vector.hpp"

#include "../../cell/Cell.hpp"
#include "../../genome/RootID.hpp"

namespace dish2 {

template<typename Spec, typename ParentIterator>
class ElapsedInsertionsDeletionsConstWrapper : public ParentIterator {

  using parent_t = ParentIterator;

public:

  ElapsedInsertionsDeletionsConstWrapper() = default;

  ElapsedInsertionsDeletionsConstWrapper(const parent_t& in) : parent_t(in) {}

  using value_type = const uint64_t;
  using pointer = value_type*;
  using reference = value_type&;

  value_type& operator*() {
    return parent_t::operator*(
      ).genome->mutation_counter.insertion_deletion_counter;
  }

  ElapsedInsertionsDeletionsConstWrapper& operator++() {
    parent_t::operator++();
    return *this;
  }

  ElapsedInsertionsDeletionsConstWrapper operator++(int) {
    const auto res = *this;
    operator++();
    return res;
  }

  ElapsedInsertionsDeletionsConstWrapper& operator--() {
    parent_t::operator--();
    return *this;
  }

  ElapsedInsertionsDeletionsConstWrapper operator--(int) {
    ElapsedInsertionsDeletionsConstWrapper res{ *this };
    res -= 1;
    return res;
  }

  template<
    typename RHS,
    typename = typename std::enable_if<
      std::is_arithmetic<RHS>::value, RHS
    >::type
  >
  ElapsedInsertionsDeletionsConstWrapper operator+(const RHS rhs) {
    ElapsedInsertionsDeletionsConstWrapper res{ *this };
    res += rhs;
    return res;
  }

  template<
    typename RHS,
    typename = typename std::enable_if<
      std::is_arithmetic<RHS>::value, RHS
    >::type
  >
  ElapsedInsertionsDeletionsConstWrapper operator-(const RHS rhs) {
    ElapsedInsertionsDeletionsConstWrapper res{ *this };
    res -= rhs;
    return res;
  }

};

} // namespace dish2

#endif // #ifndef DISH2_WORLD_ITERATORS_ELAPSEDINSERTIONSDELETIONSCONSTWRAPPER_HPP_INCLUDE
