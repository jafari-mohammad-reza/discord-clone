import {ModifyTopicDto} from '../../dtos/modify-topic.dto';

export class UpdateTopicCommand {
    constructor(
        public readonly id: number,
        public readonly dto: ModifyTopicDto,
    ) {
    }
}
