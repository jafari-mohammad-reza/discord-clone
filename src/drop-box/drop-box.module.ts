import { Global, Module } from '@nestjs/common';
import { DropBoxConfigurableModuleClass } from './drop-box.module-defenition';
import { DropBoxService } from './drop-box.service';

@Global()
@Module({
  providers: [DropBoxService],
  exports: [DropBoxService],
})
export class DropBoxModule extends DropBoxConfigurableModuleClass {}
