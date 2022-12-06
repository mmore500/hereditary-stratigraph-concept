#pragma once
#ifndef HSTRAT_CONFIG_TRY_READ_CONFIG_FILE_HPP_INCLUDE
#define HSTRAT_CONFIG_TRY_READ_CONFIG_FILE_HPP_INCLUDE

#include <cstdlib>
#include <filesystem>
#include <iostream>

#include "Config.hpp"

namespace hstrat {

void try_read_config_file(hstrat::Config & config, emp::ArgManager & am) {
  if(std::filesystem::exists("hstrat.cfg")) {
    std::cout << "Configuration read from hstrat.cfg" << '\n';
    config.Read("hstrat.cfg");
  }
  am.UseCallbacks();
  if (am.HasUnused())
    std::exit(EXIT_FAILURE);
}

} // namespace hstrat

#endif // #ifndef HSTRAT_CONFIG_TRY_READ_CONFIG_FILE_HPP_INCLUDE
