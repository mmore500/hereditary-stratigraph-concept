#pragma once
#ifndef HSTRAT_CONFIG_SETUP_CONFIG_NATIVE_HPP_INCLUDE
#define HSTRAT_CONFIG_SETUP_CONFIG_NATIVE_HPP_INCLUDE

#include "Empirical/include/emp/config/ArgManager.hpp"

#include "try_read_config_file.hpp"

namespace hstrat {

void setup_config_native(hstrat::Config & config, int argc, char* argv[]) {
  auto specs = emp::ArgManager::make_builtin_specs(&config);
  emp::ArgManager am(argc, argv, specs);
  hstrat::try_read_config_file(config, am);
}

} // namespace hstrat

#endif // #ifndef HSTRAT_CONFIG_SETUP_CONFIG_NATIVE_HPP_INCLUDE
