import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { DeleteChannelEvent } from './events/impl/delete-channel.event';
import { NotifyUserCommand } from './commands/impl/notify-user.command';

@Injectable()
export class ChannelSaga {
  @Saga()
  ChannelDeleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(DeleteChannelEvent),
      map(
        (event) =>
          new NotifyUserCommand(
            event.members,
            event.channel.title,
            'Channel removed and its not available no more',
          ),
      ),
    );
  };
  z;
}
