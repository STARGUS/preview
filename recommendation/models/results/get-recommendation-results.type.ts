import { Field, ObjectType } from '@nestjs/graphql';

import { BaseResultsType } from '@app/common/models/results';
import { Recommendation } from '../recommendation.model';

@ObjectType()
export class GetRecommendationResultsType extends BaseResultsType {
    @Field(() => [Recommendation], {
        nullable: true,
        description: 'The Recommendations',
    })
    recommendation: Recommendation[] | null;
}
