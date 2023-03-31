export class NotifyUserCommand {
  constructor(
    public readonly members: { email: string }[] | string,
    public readonly channelTitle: string,
    public readonly message: string,
  ) {}
}
