import { IsDate, IsOptional, IsUUID } from '@nestjs/class-validator';
import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class UpdateRecommendationInputType {
    @IsOptional()
    @IsUUID(4, { each: true })
    @Field(() => [ID], {
        description: 'Id of parrent recommendation',
        nullable: true,
    })
    id: string[];

    @IsOptional()
    @IsDate()
    @Field(() => Date, { nullable: true })
    lifetime?: Date;
}
