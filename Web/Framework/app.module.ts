import { Module } from '@nestjs/common';
import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers'
import { Repository } from '../../CommandHandlers/Framework'
import { SmershModule } from './smersh.module';
import { CqrsModule, EventPublisher, EventBus, CommandBus } from '@nestjs/cqrs'




@Module({
    imports: [CqrsModule, SmershModule],
})
export class AppModule {

}