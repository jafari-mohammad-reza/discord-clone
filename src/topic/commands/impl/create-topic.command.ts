import {ModifyTopicDto} from '../../dtos/modify-topic.dto';

export class CreateTopicCommand {
    constructor(public readonly dto: ModifyTopicDto) {
    }
}
