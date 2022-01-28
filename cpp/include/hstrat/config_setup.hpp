#pragma once
#ifndef HSTRAT_CONFIG_SETUP_HPP_INCLUDE
#define HSTRAT_CONFIG_SETUP_HPP_INCLUDE

#include <filesystem>

#include "Empirical/include/emp/config/ArgManager.hpp"
#include "Empirical/include/emp/prefab/ConfigPanel.hpp"
#include "Empirical/include/emp/web/UrlParams.hpp"
#include "Empirical/include/emp/web/web.hpp"

#include "hstrat/Config.hpp"

namespace hstrat {

void use_existing_config_file(hstrat::Config & config, emp::ArgManager & am) {
  if(std::filesystem::exists("hstrat.cfg")) {
    std::cout << "Configuration read from hstrat.cfg" << "\n";
    config.Read("hstrat.cfg");
  }
  am.UseCallbacks();
  if (am.HasUnused())
    std::exit(EXIT_FAILURE);
}

void setup_config_web(hstrat::Config & config)  {
  auto specs = emp::ArgManager::make_builtin_specs(&config);
  emp::ArgManager am(emp::web::GetUrlParams(), specs);
  use_existing_config_file(config, am);
}

void setup_config_native(hstrat::Config & config, int argc, char* argv[]) {
  auto specs = emp::ArgManager::make_builtin_specs(&config);
  emp::ArgManager am(argc, argv, specs);
  use_existing_config_file(config, am);
}

} // namespace hstrat

#endif // #ifndef HSTRAT_CONFIG_SETUP_HPP_INCLUDE
