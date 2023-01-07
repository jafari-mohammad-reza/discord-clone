export class KickFromChannelEvent {
  constructor(
    public readonly userId: string,
    public readonly channelTitle: string
  ) {
  }
}
