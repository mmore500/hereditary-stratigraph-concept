#include <iostream>

#include "Empirical/include/emp/base/vector.hpp"

#include "hstrat/config/Config.hpp"
#include "hstrat/config/setup_config_native.hpp"

// This is the main function for the NATIVE version of Hereditary Stratigraph Proof of Concept.

hstrat::Config cfg;

int main(int argc, char* argv[]) {
  // Set up a configuration panel for native application
  setup_config_native(cfg, argc, argv);
  cfg.Write(std::cout);

  std::cout << "Hello, world!" << "\n";

  return 0;
}
