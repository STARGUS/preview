import { Field, ObjectType } from '@nestjs/graphql';

import { BaseResultsType } from '@app/common/models/results';
import { Recommendation } from '../recommendation.model';


@ObjectType()
export class CreateRecommendationResultsType extends BaseResultsType {
    @Field(() => [Recommendation], {
        nullable: true,
        description: 'Recommendations Anime',
    })
    recommendations: Recommendation[] | null;
}
