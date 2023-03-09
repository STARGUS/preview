import { RecommendationService } from './services/recommendation.service';
import { Module } from '@nestjs/common';
import { RecommendationMutationResolver } from './resolvers/recommendation-mutation.resolver';
import { RecommendationQueryResolver } from './resolvers/recommendation-query.resolver';
import { RecommendationRootResolver } from './resolvers/recommendation-root.resolver';

@Module({
    imports: [],
    controllers: [],
    providers: [
        RecommendationMutationResolver,
        RecommendationQueryResolver,
        RecommendationRootResolver,
        RecommendationService,
    ],
})
export class RecommendationModule {}
