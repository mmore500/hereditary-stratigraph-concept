#include <iostream>

#include "Empirical/include/emp/prefab/ConfigPanel.hpp"
#include "Empirical/include/emp/web/TextArea.hpp"
#include "Empirical/include/emp/web/web.hpp"

#include "hstrat/Config.hpp"
#include "hstrat/config_setup.hpp"
#include "hstrat/example.hpp"

emp::web::Document doc("emp_base");

hstrat::Config cfg;

int main() {
  doc << "<h1>Hello, browser!</h1>";

  // Set up a configuration panel for web application
  hstrat::setup_config_web(cfg);
  cfg.Write(std::cout);
  emp::prefab::ConfigPanel example_config_panel(cfg);
  example_config_panel.ExcludeSetting("SUPER_SECRET");
  example_config_panel.SetRange("SEED", "-1", "100", "1");
  doc << example_config_panel;

  // An example to show how the Config Panel could be used
  // to control the color of text in an HTML text area
  emp::web::TextArea example_area("example_area");
  example_area.SetSize(cfg.SIZE(), cfg.SIZE());
  example_config_panel.SetOnChangeFun([](const std::string & setting, const std::string & value){
    emp::web::TextArea example_area = doc.TextArea("example_area");
    example_area.SetCSS("color", cfg.COLOR());
    example_area.Redraw();
  });

  doc << example_area;

  std::cout << "Hello, console!" << '\n';

  return hstrat::example();
}
