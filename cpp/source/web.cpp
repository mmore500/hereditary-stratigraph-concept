#include <iostream>

#include "Empirical/include/emp/prefab/ConfigPanel.hpp"
#include "Empirical/include/emp/web/web.hpp"

#include "hstrat/config/Config.hpp"
#include "hstrat/config/setup_config_web.hpp"
#include "hstrat/example.hpp"

emp::web::Document doc("emp_base");

hstrat::Config cfg;

int main() {
  doc << "<h1>Hello, browser!</h1>";

  // Set up a configuration panel for web application
  setup_config_web(cfg);
  cfg.Write(std::cout);
  emp::prefab::ConfigPanel example_config_panel(cfg);
  doc << example_config_panel;

  std::cout << "Hello, console!" << '\n';

  return hstrat::example();
}
