import { ConfigurableModuleBuilder, DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GoogleDriveService } from "./google-drive.service";
import { AsyncGoogleDriveConfig, GoogleDriveConfig } from "../core/interfaces/google-drive.config";
import { ConfigurableModuleClass } from "./google-drive.module-definition";
@Global()
@Module({
  providers:[GoogleDriveService],
  exports:[GoogleDriveService]
})
export class GoogleDriveModule extends ConfigurableModuleClass {
}
