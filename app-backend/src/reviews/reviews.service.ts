import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateReviewDto } from "../dtos/create-review-dto";
import { UpdateReviewDto } from "../dtos/update-review-dto";
import { GetReviewsQueryDto } from "../dtos/get-reviews-query-dto";
import { AppsService } from "../apps/apps.service";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appsService: AppsService,
  ) {}

  async create(appId: number, dto: CreateReviewDto) {
    const app = await this.prisma.app.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new NotFoundException("Aplicativo não encontrado.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new BadRequestException("Usuário informado não existe.");
    }

    const review = await this.prisma.review.create({
      data: {
        appId,
        userId: dto.userId,
        name: dto.name?.trim() ? dto.name : user.name,
        markdownText: dto.markdownText,
        rating: dto.rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    await this.appsService.recalculateRating(appId);

    return {
      message: "Avaliação cadastrada com sucesso!",
      data: review,
    };
  }

  async findByApp(appId: number, query?: GetReviewsQueryDto) {
    const app = await this.prisma.app.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new NotFoundException("Aplicativo não encontrado.");
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.review.count({
        where: { appId },
      }),
      this.prisma.review.findMany({
        where: { appId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException("Avaliação não encontrada.");
    }

    return review;
  }

  async update(id: number, dto: UpdateReviewDto) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        name: dto.name,
        markdownText: dto.markdownText,
        rating: dto.rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (dto.rating !== undefined) {
      await this.appsService.recalculateRating(existing.appId);
    }

    return {
      message: "Avaliação atualizada com sucesso!",
      data: updated,
    };
  }

  async delete(id: number) {
    const existing = await this.findOne(id);

    await this.prisma.review.delete({
      where: { id },
    });

    await this.appsService.recalculateRating(existing.appId);

    return {
      message: "Avaliação removida com sucesso!",
    };
  }
}
