import { PrismaService } from '@app/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Recommendation, RecommendationStatus } from '@prisma/client';
import { createUserStatisticOptions } from '../../user/utils/create-user-statistic-option.util';
import {
    CreateRecommendationInput,
    DeleteRecommendationInputType,
    UpdateRecommendationInputType,
} from '../models/inputs';
import {
    GetRecommendationResultsType,
    DeleteRecommendationResultsType,
    CreateRecommendationResultsType,
    UpdateRecommendationResultsType,
} from '../models/results';
import { createRecommendation } from '../utils/create-recommendation.util';

@Injectable()
export class RecommendationService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async getRecommendation(take = 15): Promise<GetRecommendationResultsType> {
        const nowDate: string = new Date().toISOString();
        const recommendationList: any =
            await this.prisma.recommendation.findMany({
                where: {
                    lifetime: {
                        gte: nowDate,
                    },
                },
                include: {
                    user: true,
                    anime: true,
                },
                take,
            });
        if (recommendationList.length < 15) {
            const newRecommendationList = await (
                await this.createRecommendation({
                    length: 15 - recommendationList.length,
                })
            )?.recommendations;
            newRecommendationList &&
                recommendationList.push(...newRecommendationList);
        }
        return {
            success: true,
            errors: [],
            recommendation: recommendationList,
        };
    }

    async createRecommendation({
        length,
        user_id,
        anime_id,
    }: CreateRecommendationInput): Promise<CreateRecommendationResultsType> {
        const newDateDay = Number(this.configService.get('LIFETIME'));
        const newDateLifeTime =
            new Date(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate() + 1 + newDateDay,
            )
                .toISOString()
                .slice(0, 10) + 'T00:00:00.000Z';
        if (length) {
            const dateLifeTimeSelect =
                new Date(
                    new Date().getUTCFullYear(),
                    new Date().getUTCMonth(),
                    new Date().getUTCDate() + 1 - newDateDay,
                )
                    .toISOString()
                    .slice(0, 10) + 'T00:00:00.000Z';
            const anime = await this.prisma.anime.findMany({
                where: {
                    AND: [
                        {
                            statistics: { not: Prisma.AnyNull },
                        },
                        {
                            statistics: { not: Prisma.DbNull },
                        },
                        {
                            statistics: { not: Prisma.JsonNull },
                        },
                        {
                            created_at: { gte: dateLifeTimeSelect },
                        },
                        {
                            recommendation: {
                                some: {
                                    lifetime: {
                                        lte: new Date(),
                                    },
                                },
                            },
                        },
                    ],
                },
                orderBy: [
                    {
                        created_at: 'desc',
                    },
                ],
                select: {
                    id: true,
                    statistics: true,
                },
            });
            if (anime.length > 0) {
                const animeStatistic =
                    anime.length > 0 &&
                    (await (
                        await createUserStatisticOptions(anime)
                    )?.sort(
                        (a: any, b: any) =>
                            (b.statistics.requests - a.statistics.requests &&
                                b.statistics.userRating[5] -
                                a.statistics.userRating[5]) ||
                            (b.statistics.requests - a.statistics.requests &&
                                b.statistics.score - a.statistics.score),
                    ));
                animeStatistic.length = length;
                const resultRecommendation: any =
                    await this.prisma.recommendation.createMany({
                        data: await createRecommendation(animeStatistic, {
                            lifetime: newDateLifeTime,
                            user_id,
                        }),
                    });
                return {
                    success: true,
                    errors: [],
                    recommendations: resultRecommendation as any,
                };
            }
            return {
                success: false,
                errors: [{ property: 'asf', value: 401, reason: 'asd' }], // код ошибки + добавить обработчик
                recommendations: null,
            };
        }
        const errors: Array<{
            property: string;
            reason: string;
            value: string | number;
        }> = [];
        const resultRecommendation: any = [];
        if (!!anime_id)
            for await (const item of anime_id) {
                try {
                    resultRecommendation.push(
                        await this.prisma.recommendation.create({
                            data: {
                                lifetime: newDateLifeTime,
                                anime_id: item,
                                status: !!user_id
                                    ? RecommendationStatus.USER
                                    : RecommendationStatus.SYSTEM,
                                user_id,
                            },
                            include: {
                                anime: true,
                                user: true,
                            },
                        }),
                    );
                } catch (error) {
                    errors.push({
                        property:
                            'RecommendationMutations.createRecommendation',
                        reason: `Anime with this ID:${item} is already present in this scheme`,
                        value: 422,
                    });
                }
            }
        if (resultRecommendation?.length !== anime_id?.length) {
            const recomList = await this.prisma.recommendation.findMany({
                where: {
                    id: {
                        in: anime_id,
                    },
                },
                select: {
                    id: true,
                    lifetime: true,
                },
            });
            for await (const item of recomList) {
                if (
                    item.lifetime.toISOString().slice(0, 10) !==
                    newDateLifeTime.slice(0, 10)
                ) {
                    await this.prisma.recommendation.update({
                        where: { id: item.id },
                        data: {
                            lifetime: newDateLifeTime,
                        },
                        include: {
                            anime: true,
                            user: true,
                        },
                    });
                }
            }
        }
        await this.deleteRecommendationByTime();
        return {
            success:
                !resultRecommendation && resultRecommendation.length > 0
                    ? true
                    : false,
            errors,
            recommendations: resultRecommendation ?? null,
        };
    }

    async updateRecommendation(
        { lifetime, id }: UpdateRecommendationInputType,
        user_id?: string,
    ): Promise<UpdateRecommendationResultsType> {
        const errors = [];
        const newDateDay = Number(this.configService.get('LIFETIME'));
        const newDateLifeTime =
            new Date(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate() + 1 + newDateDay,
            )
                .toISOString()
                .slice(0, 10) + 'T00:00:00.000Z';
        if (id && Array.isArray(id) && id?.length > 0) {
            const recommendationResult = [];
            for await (const el of id) {
                try {
                    const dataRecommendation =
                        await this.prisma.recommendation.update({
                            where: {
                                id: el,
                            },
                            data: {
                                user_id: user_id ?? undefined,
                                status: user_id
                                    ? RecommendationStatus.USER
                                    : RecommendationStatus.SYSTEM,
                                lifetime: lifetime ?? newDateLifeTime,
                            },
                            include: {
                                anime: true,
                                user: true,
                            },
                        });
                    recommendationResult.push(dataRecommendation);
                } catch (error) {
                    errors.push({
                        property:
                            'RecommendationMutations.createRecommendation',
                        reason: `Anime with this ID:${el} is not present in this scheme`,
                        value: 422,
                    });
                }
            }
            await this.deleteRecommendationByTime();
            return {
                success: true,
                errors: errors,
                recommendation: recommendationResult as any,
            };
        }
        return {
            success: false,
            errors: [],
            recommendation: null,
        };
    }
    async deleteRecommendation({
        id,
        anime_id,
    }: DeleteRecommendationInputType): Promise<DeleteRecommendationResultsType> {
        const recommendationDelete: Recommendation[] = [];
        const reultDelete = async (id: Array<string>) => {
            for await (const item of id) {
                recommendationDelete.push(
                    await this.prisma.recommendation.delete({
                        where: {
                            id: item,
                        },
                    }),
                );
            }
        };
        if (!!id) reultDelete(id);
        if (!!anime_id) reultDelete(anime_id);
        return {
            errors: [],
            success: true,
            recommendation: recommendationDelete as any,
        };
    }

    async deleteRecommendationByTime() {
        const recommendationDelete =
            await this.prisma.recommendation.deleteMany({
                where: {
                    lifetime: {
                        lte: new Date().toISOString(),
                    },
                },
            });
        return {
            errors: [],
            success: true,
            recommendation_count_delete: recommendationDelete.count,
        };
    }
}
