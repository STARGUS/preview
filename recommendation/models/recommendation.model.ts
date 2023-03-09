import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RecommendationStatus } from '@app/common/models/enums/recommendation-status.enum';
import { Anime } from '../../anime/models/anime.model';
import { User } from '../../user/models/user.model';

@ObjectType()
export class Recommendation {
    @Field(() => ID, {
        description: 'Unique ID of the recommendation',
    })
    id: string;

    @Field(() => RecommendationStatus, {
        description: 'Recommendation status ',
        defaultValue: RecommendationStatus.SYSTEM,
    })
    status: RecommendationStatus;

    @Field(() => Date, {
        description: 'lifetime of the recommendation',
    })
    lifetime: Date;

    @Field(() => Anime, {
        nullable: true,
        description: 'The anime',
    })
    anime?: Anime;

    @Field(() => User, {
        nullable: true,
        description: 'The user',
    })
    user?: User;

    @Field(() => ID, {
        nullable: true,
        description: 'The anime id',
    })
    anime_id: string;

    @Field(() => ID, {
        nullable: true,
        description: 'The user id',
    })
    user_id?: string;
}
