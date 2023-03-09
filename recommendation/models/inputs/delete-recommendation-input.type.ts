import { IsOptional, IsUUID } from '@nestjs/class-validator';
import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class DeleteRecommendationInputType {
    @IsOptional()
    @IsUUID(4, { each: true })
    @Field(() => [ID], {
        description: 'Id of parrent recommendation',
        nullable: true,
    })
    id?: string[];

    @IsOptional()
    @IsUUID(4, { each: true })
    @Field(() => [ID], {
        description: 'Id of parrent anime',
        nullable: true,
    })
    anime_id?: string[];
}
