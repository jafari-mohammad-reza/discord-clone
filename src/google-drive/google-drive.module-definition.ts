
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { GoogleDriveConfig } from "../core/interfaces/google-drive.config";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN:GOOGLE_DRIVE_CONFIG } =
  new ConfigurableModuleBuilder<GoogleDriveConfig>().build();
