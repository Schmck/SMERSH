import { Module } from '@nestjs/common';
import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers/index'
import { Repository } from '../../CommandHandlers/Framework'
import { SmershModule } from './smersh.module';
import { CqrsModule } from '@nestjs/cqrs'


@Module({
    imports: [CqrsModule, SmershModule],
})
export class AppModule {

}

