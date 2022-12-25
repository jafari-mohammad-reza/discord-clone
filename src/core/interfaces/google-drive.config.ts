import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface GoogleDriveConfig {
  client_id :string;
  client_email :string;
  client_secret :string;
  project_id:string;
  auth_url:string;
  token_url:string;
  auth_provider_cert:string;
  private_key_id:string;
  private_key:string;
}
export const  AsyncGoogleDriveConfig = new ConfigurableModuleBuilder<GoogleDriveConfig>().build()
