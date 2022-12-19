export class InvalidIpEvent {
  constructor(public readonly email: string, public readonly ip: string) {}
}
