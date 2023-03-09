import { Field, ObjectType } from '@nestjs/graphql';

import { BaseResultsType } from '@app/common/models/results';
import { Anime } from '../../../anime/models/anime.model';

ObjectType();
export class GetAnimeByRecommendationResultsType extends BaseResultsType {
    @Field(() => [Anime], {
        nullable: true,
        description: 'Get Anime by recommendation',
    })
    anime_list: Anime[] | null;
}
