export class RegisterEvent {
  constructor(
    public readonly email: string,
    public readonly verificationCode: number,
  ) {}
}
