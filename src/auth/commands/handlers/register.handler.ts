import { PrismaService } from './../../../prisma.service';
import { RegisterCommand } from './../impl/register.command';
import { CommandHandler , ICommandHandler} from "@nestjs/cqrs";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand>{   
    execute(command: RegisterCommand): Promise<void> {
        throw new Error('Method not implemented.');
    }

}