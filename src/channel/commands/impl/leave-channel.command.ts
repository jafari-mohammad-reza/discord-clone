export class LeaveChannelCommand {
    constructor(
        public readonly channelId: string,
        public readonly user: { id: string },
    ) {
    }
}
