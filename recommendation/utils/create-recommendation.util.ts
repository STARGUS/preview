import { RecommendationStatus } from '@app/common/models/enums/recommendation-status.enum';
import { Prisma } from '@prisma/client';

export async function createRecommendation(
    array: any,
    { lifetime, user_id }: { lifetime: string; user_id?: string },
): Promise<Prisma.Enumerable<Prisma.RecommendationCreateManyInput>> {
    return await array.map((el: { id: string }) => ({
        anime_id: el.id ?? el,
        lifetime,
        user_id,
        status: !!user_id
            ? RecommendationStatus.USER
            : RecommendationStatus.SYSTEM,
    }));
}
