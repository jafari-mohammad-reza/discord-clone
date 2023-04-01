import {User} from '@prisma/client/generated';

export class JoinChannelCommand {
    constructor(public readonly id: string, public readonly user: User) {
    }
}
