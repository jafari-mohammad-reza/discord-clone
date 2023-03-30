import {Module} from '@nestjs/common';
import {DeveloperController} from './developer.controller';
import {SearchModule} from '../search/search.module';

@Module({
    imports: [
        SearchModule.registerAsync({
            useFactory: async () => ({
                index: 'channel',
            }),
        }),
    ],
    controllers: [DeveloperController],
})
export class DeveloperModule {
}
