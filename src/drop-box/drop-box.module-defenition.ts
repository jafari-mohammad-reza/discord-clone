import { ConfigurableModuleBuilder } from "@nestjs/common";
import { DropBoxConfig } from "./drop-box.config";

export const {
  ConfigurableModuleClass: DropBoxConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: DROP_BOX_CONFIG
} = new ConfigurableModuleBuilder<DropBoxConfig>().build();
