import { Args, ResolveField, Resolver } from '@nestjs/graphql';

import { AuthMiddleware } from '@app/common/middlewares/auth.middleware';

import { GetRecommendationResultsType } from '../models/results/get-recommendation-results.type';
import { RecommendationService } from '../services/recommendation.service';

import {
    RecommendationQueryType,
    RecommendationRootResolver,
} from './recommendation-root.resolver';

@Resolver(RecommendationQueryType)
export class RecommendationQueryResolver extends RecommendationRootResolver {
    constructor(private recommendationService: RecommendationService) {
        super();
    }

    @ResolveField(() => GetRecommendationResultsType, {
        middleware: [AuthMiddleware],
    })
    async getRecommendation(
        @Args('recommendation_count', { nullable: true }) take: number,
    ): Promise<GetRecommendationResultsType> {
        return await this.recommendationService.getRecommendation(take);
    }

}
