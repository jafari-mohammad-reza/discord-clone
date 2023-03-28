export class LoginCommand {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
    public readonly ip: string,
  ) {}
}
