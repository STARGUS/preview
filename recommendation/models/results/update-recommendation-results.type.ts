import { Field, ObjectType } from '@nestjs/graphql';

import { BaseResultsType } from '@app/common/models/results';
import { Recommendation } from '../recommendation.model';


@ObjectType()
export class UpdateRecommendationResultsType extends BaseResultsType {
    @Field(() => [Recommendation], {
        nullable: true,
        description: 'Recommendations Anime',
    })
    recommendation: Recommendation[] | null;
}
