import { IsOptional, IsUUID } from '@nestjs/class-validator';
import { ArgsType, Field, ID, Int } from '@nestjs/graphql';

@ArgsType()
export class CreateRecommendationInputType {
    @IsUUID(4, { each: true })
    @Field(() => [ID], {
        description: 'Id of parrent anime',
    })
    anime_id: string[];
}

@ArgsType()
export class CreateRecommendationInput {
    @IsOptional()
    @IsUUID(4, { each: true })
    @Field(() => ID, { nullable: true })
    user_id?: string;

    @IsUUID(4, { each: true })
    @Field(() => [ID], {
        nullable: true,
        description: 'Id of parrent anime',
    })
    anime_id?: string[];

    @Field(() => Int, { nullable: true })
    length?: number;
}
