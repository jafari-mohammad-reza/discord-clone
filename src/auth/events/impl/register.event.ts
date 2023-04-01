export class RegisterEvent {
    constructor(
        public readonly email: string,
        public readonly username: string,
        public readonly verificationCode: number,
    ) {
    }
}
