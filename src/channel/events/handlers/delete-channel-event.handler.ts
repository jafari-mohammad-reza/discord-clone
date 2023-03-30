import {EventsHandler, IEventHandler} from '@nestjs/cqrs';
import {DeleteChannelEvent} from '../impl/delete-channel.event';
import {DropBoxService} from '../../../drop-box/drop-box.service';
import {SearchService} from '../../../search/search.service';

@EventsHandler(DeleteChannelEvent)
export class DeleteChannelEventHandler
    implements IEventHandler<DeleteChannelEvent> {
    constructor(
        private readonly dropBoxService: DropBoxService,
        private readonly searchService: SearchService,
    ) {
    }

    async handle(event: DeleteChannelEvent): Promise<void> {
        try {
            const {channel} = event;
            this.dropBoxService.deleteImage(channel.logo, channel.logoPath);
            await this.searchService.removeIndex(channel.id);
        } catch (err) {
            console.error(err);

            return;
        }
    }
}
