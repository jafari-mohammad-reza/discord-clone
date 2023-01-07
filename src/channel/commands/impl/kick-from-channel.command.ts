export class KickFromChannelCommand {
  constructor(
    public readonly userId: string,
    public readonly channelId: string
  ) {
  }
}
