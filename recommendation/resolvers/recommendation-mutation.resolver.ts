import { UseGuards } from '@nestjs/common';
import { Args, ResolveField, Resolver } from '@nestjs/graphql';

import { AccessToken } from '@app/common/decorators';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthMiddleware } from '@app/common/middlewares/auth.middleware';

import { DeleteRecommendationResultsType } from '../models/results/delete-recommendation-results.type';
import { CreateRecommendationResultsType } from '../models/results/create-recommendation-results.type';
import { CreateRecommendationInputType } from '../models/inputs/create-recommendation-input.type';
import { UpdateRecommendationResultsType } from '../models/results/update-recommendation-results.type';
import { UpdateRecommendationInputType } from '../models/inputs/update-recommendation-input.type';
import { RecommendationService } from '../services/recommendation.service';

import {
    RecommendationMutationType,
    RecommendationRootResolver,
} from './recommendation-root.resolver';
import { DeleteRecommendationInputType } from '../models/inputs';

@Resolver(RecommendationMutationType)
export class RecommendationMutationResolver extends RecommendationRootResolver {
    constructor(private recommendationService: RecommendationService) {
        super();
    }

    @ResolveField(() => CreateRecommendationResultsType, {
        middleware: [AuthMiddleware],
    })
    @UseGuards(JwtAuthGuard)
    async createRecommendation(
        @Args() args: CreateRecommendationInputType,
        @AccessToken() user_id: string,
    ): Promise<CreateRecommendationResultsType> {
        return await this.recommendationService.createRecommendation({
            anime_id: args.anime_id,
            user_id,
        });
    }

    @ResolveField(() => UpdateRecommendationResultsType, {
        middleware: [AuthMiddleware],
    })
    @UseGuards(JwtAuthGuard)
    async updateRecommendation(
        @Args() args: UpdateRecommendationInputType,
        @AccessToken() user_id: string,
    ): Promise<UpdateRecommendationResultsType> {
        return await this.recommendationService.updateRecommendation(
            args,
            user_id,
        );
    }

    @ResolveField(() => DeleteRecommendationResultsType, {
        middleware: [AuthMiddleware],
    })
    @UseGuards(JwtAuthGuard)
    async deleteRecommendation(
        @Args() id: DeleteRecommendationInputType,
    ): Promise<DeleteRecommendationResultsType> {
        return await this.recommendationService.deleteRecommendation(id);
    }
}
