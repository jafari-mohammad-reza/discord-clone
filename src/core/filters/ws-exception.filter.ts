import {ArgumentsHost, Catch} from '@nestjs/common';
import {BaseWsExceptionFilter} from '@nestjs/websockets';

@Catch()
export class WebSocketExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        super.catch(exception, host);
    }
}
