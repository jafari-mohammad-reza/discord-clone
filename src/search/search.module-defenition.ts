import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface SearchModuleConfig {
  index: string;
}

export const {
  ConfigurableModuleClass: SearchConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: SEARCH_SERVICE_INDEX
} = new ConfigurableModuleBuilder<SearchModuleConfig>().build();
