import { PrismaService } from "../../../core/prisma.service";
import { UpdateTopicHandler } from "../handlers/update-topic.handler";
import { Test } from "@nestjs/testing";
import { CqrsModule } from "@nestjs/cqrs";
import { CoreModule } from "../../../core/core.module";
import { ModifyTopicDto } from "../../dtos/modify-topic.dto";
import { HttpException, NotFoundException } from "@nestjs/common";
import { AlreadyExistException } from "../../../core/exceptions/already-exist.exception";

describe("update topic handler", function() {
  let prismaService: PrismaService;
  let updateTopicHandler: UpdateTopicHandler;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule, CoreModule],
      providers: [UpdateTopicHandler]
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    updateTopicHandler = module.get<UpdateTopicHandler>(UpdateTopicHandler);
  });
  it("should update topic successfully", async function() {
    const topicDto: ModifyTopicDto = {
      name: "Test-topic",
      channelId: "some-channel-id"
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue(null);
    prismaService.topic.findUnique = jest.fn().mockResolvedValue({});
    prismaService.channel.findUnique = jest.fn().mockResolvedValue({});
    prismaService.topic.update = jest
      .fn()
      .mockResolvedValue({ ...topicDto, id: 1 });
    const response = await updateTopicHandler.execute({ dto: topicDto, id: 1 });
    expect(response).toMatchObject({ ...topicDto, id: 1 });
  });
  it("should update topic fail there is already a topic with this id", async function() {
    const topicDto: ModifyTopicDto = {
      name: "Test-topic",
      channelId: "some-channel-id"
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue({});
    await updateTopicHandler
      .execute({ dto: topicDto, id: 1 })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(AlreadyExistException);
      });
  });
  it("should update topic fail there is no topic with this id", async function() {
    const topicDto: ModifyTopicDto = {
      name: "Test-topic",
      channelId: "some-channel-id"
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue(null);
    prismaService.topic.findUnique = jest.fn().mockResolvedValue(null);
    prismaService.channel.findUnique = jest.fn().mockResolvedValue({});
    await updateTopicHandler
      .execute({ dto: topicDto, id: 1 })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
  it("should update topic fail channel not exist", async function() {
    const topicDto: ModifyTopicDto = {
      name: "Test-topic",
      channelId: "some-channel-id"
    };
    prismaService.topic.findFirst = jest.fn().mockResolvedValue(null);
    prismaService.topic.findUnique = jest.fn().mockResolvedValue({});
    prismaService.channel.findUnique = jest.fn().mockResolvedValue(null);
    await updateTopicHandler
      .execute({ dto: topicDto, id: 1 })
      .catch((err: HttpException) => {
        expect(err).toBeInstanceOf(NotFoundException);
      });
  });
});
