import {Module} from '@nestjs/common';
import {textRoomGateway} from './text-room.gateway';
import {TextRoomService} from './text-room.service';

@Module({
    providers: [textRoomGateway, TextRoomService],
})
export class textRoomModule {
}
