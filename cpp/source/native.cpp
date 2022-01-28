#include <iostream>

#include "Empirical/include/emp/base/vector.hpp"

#include "hstrat/Config.hpp"
#include "hstrat/config_setup.hpp"
#include "hstrat/example.hpp"

// This is the main function for the NATIVE version of Hereditary Stratigraph Proof of Concept.

hstrat::Config cfg;

int main(int argc, char* argv[]) {

  // Set up a configuration panel for native application
  hstrat::setup_config_native(cfg, argc, argv);
  cfg.Write(std::cout);

  std::cout << "Hello, world!" << '\n';

  return hstrat::example();
}
