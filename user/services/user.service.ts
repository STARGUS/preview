import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { userDefaults } from '@app/common/defaults/user-defaults';
import { PaginationInputType } from '@app/common/models/inputs';
import { PaginationService } from '@app/common/services/pagination.service';
import { PrismaService } from '@app/common/services/prisma.service';
import { transformPaginationUtil } from '@app/common/utils/transform-pagination.util';

import { CreateUserInputType } from '../models/inputs/create-user-input.type';
import { UpdateUserInputType } from '../models/inputs/update-user-input.type';
import { CreateUserResultsType } from '../models/results/create-user-results.type';
import { UpdateUserResultsType } from '../models/results/update-user-results.type';
import { GetListUserResultsType } from '../models/results/get-list-user-results.type';
import { GetUserResultsType } from '../models/results/get-user-results.type';
import { mediaConnectUtil } from '../utils/media-connect.util';
import { UpdateUserFavouritesInputType } from '../models/inputs/update-user-favourites-input.type';
import { createUserStatisticOptions } from '../utils/create-user-statistic-option.util';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private paginationService: PaginationService,
        private jwtService: JwtService,
    ) {}

    async getUserList(
        args: PaginationInputType,
    ): Promise<GetListUserResultsType> {
        const userList = await this.prisma.user.findMany({
            ...transformPaginationUtil(args),
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_collections: true,
                        favourite_studios: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
        const pagination = await this.paginationService.getPagination(
            'user',
            args,
        );
        return {
            success: true,
            errors: [],
            userList: userList,
            pagination,
        };
    }

    async getUser({
        user_id,
        username,
        id,
    }: {
        user_id: string;
        username: string;
        id: string;
    }): Promise<GetUserResultsType> {
        if (!username && !user_id && !id) {
            return {
                success: false,
                user: null,
            };
        }
        const user =
            (username || user_id || id) &&
            (await this.prisma.user.findUnique({
                where: !!username
                    ? {
                          username: username,
                      }
                    : !!user_id || id
                    ? {
                          id: id ?? user_id,
                      }
                    : {},
                include: {
                    auth: true,
                    user_profile: {
                        include: {
                            favourite_animes: true,
                            favourite_authors: true,
                            favourite_characters: true,
                            favourite_genres: true,
                            favourite_collections: true,
                            favourite_studios: true,
                            user_folders: {
                                include: {
                                    animes: true,
                                },
                            },
                            user_collection: {
                                where: {
                                    is_collection: true,
                                },
                                include: {
                                    animes: true,
                                },
                            },
                        },
                    },
                },
            })) || null;

        return {
            success: true,
            user: {
                ...user,
                user_profile: {
                    ...user?.user_profile,
                    favourite_collections: await createUserStatisticOptions(
                        user?.user_profile?.favourite_collections,
                    ),
                },
            },
        };
    }

    async updateUserFavourites(
        args: UpdateUserFavouritesInputType,
    ): Promise<UpdateUserResultsType> {
        const user = await this.prisma.user.update({
            where: { id: args.id },
            data: {
                user_profile: {
                    ...mediaConnectUtil(args),
                },
            },
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            success: true,
            errors: [],
            user: user,
        };
    }

    async getUsersByEmail(
        email: string,
        args: PaginationInputType,
    ): Promise<GetListUserResultsType> {
        const userList = await this.prisma.user.findMany({
            where: { email },
            ...transformPaginationUtil(args),
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
        const pagination = await this.paginationService.getPagination(
            'user',
            args,
        );
        return {
            success: true,
            userList: userList,
            pagination,
        };
    }

    async findOneById(id: string): Promise<GetUserResultsType> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            errors: [],
            success: true,
            user: user,
        };
    }

    async findUserByEmailOrUsername(
        email: string,
        username: string | undefined,
    ) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findUserByUsername(username: string) {
        return await this.prisma.user.findFirst({
            where: {
                username,
            },
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createUser(
        args: CreateUserInputType,
    ): Promise<CreateUserResultsType> {
        const user = await this.prisma.user.create({
            data: {
                ...args,
                ...userDefaults,
                is_email_confirmed: false,
            },
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            success: true,
            user: user,
        };
    }

    async updateUser(
        args: UpdateUserInputType,
    ): Promise<UpdateUserResultsType> {
        const user = await this.prisma.user.update({
            where: { id: args.id },
            data: args,
            include: {
                auth: true,
                user_profile: {
                    include: {
                        favourite_animes: true,
                        favourite_authors: true,
                        favourite_characters: true,
                        favourite_genres: true,
                        favourite_studios: true,
                        favourite_collections: true,
                        user_folders: {
                            include: {
                                animes: true,
                            },
                        },
                        user_collection: {
                            where: {
                                is_collection: true,
                            },
                            include: {
                                animes: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            success: true,
            user: user,
        };
    }
}
