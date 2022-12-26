import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeleteChannelEvent } from '../impl/delete-channel.event';
import { DropBoxService } from '../../../drop-box/drop-box.service';

@EventsHandler(DeleteChannelEvent)
export class DeleteChannelEventHandler
  implements IEventHandler<DeleteChannelEvent>
{
  constructor(private readonly dropBoxService: DropBoxService) {}
  handle(event: DeleteChannelEvent): void {
    const { channel } = event;
    this.dropBoxService.deleteImage(channel.logo, channel.logoPath);
    // TODO remove channel from elastic search
  }
}
