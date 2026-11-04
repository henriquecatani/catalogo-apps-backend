import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateAppDto } from "../dtos/create-app-dto";
import { UpdateAppDto } from "../dtos/update-app-dto";
import { GetAppsQueryDto } from "../dtos/get-apps-query-dto";

@Injectable()
export class AppsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppDto) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: dto.developerId },
    });

    if (!developer) {
      throw new BadRequestException("Desenvolvedor informado não existe.");
    }

    const app = await this.prisma.app.create({
      data: {
        name: dto.name,
        icon: dto.icon,
        link: dto.link,
        smallDescription: dto.smallDescription,
        markdownDescription: dto.markdownDescription,
        category: dto.category,
        pricing: dto.pricing.toLowerCase(),
        developerId: dto.developerId,
        rating: 0.0,
      },
      include: {
        developer: true,
      },
    });

    return {
      message: "Aplicativo cadastrado com sucesso!",
      data: app,
    };
  }

  async findAll(query?: GetAppsQueryDto) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.developerId) {
      where.developerId = query.developerId;
    }

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.pricing) {
      where.pricing = query.pricing.toLowerCase();
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { smallDescription: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    let orderBy: any[];
    if (query?.sortBy === "alphabetical") {
      orderBy = [{ name: query.order ?? "asc" }];
    } else if (query?.sortBy === "newest") {
      orderBy = [{ createdAt: query.order ?? "desc" }];
    } else {
      // Default: ordered by Rating (desc) and alphabetically (asc)
      const ratingOrder = query?.order ?? "desc";
      orderBy = [{ rating: ratingOrder }, { name: "asc" }];
    }

    const [total, data] = await Promise.all([
      this.prisma.app.count({ where }),
      this.prisma.app.findMany({
        where,
        select: {
          id: true,
          name: true,
          icon: true,
          smallDescription: true,
          rating: true,
          pricing: true,
          developer: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy,
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
    const app = await this.prisma.app.findUnique({
      where: { id },
      include: {
        developer: true,
        reviews: {
          take: 10,
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
        },
      },
    });

    if (!app) {
      throw new NotFoundException("Aplicativo não encontrado.");
    }

    return app;
  }

  async update(id: number, dto: UpdateAppDto) {
    await this.findOne(id);

    if (dto.developerId) {
      const developer = await this.prisma.developer.findUnique({
        where: { id: dto.developerId },
      });
      if (!developer) {
        throw new BadRequestException("Desenvolvedor informado não existe.");
      }
    }

    const updated = await this.prisma.app.update({
      where: { id },
      data: {
        name: dto.name,
        icon: dto.icon,
        link: dto.link,
        smallDescription: dto.smallDescription,
        markdownDescription: dto.markdownDescription,
        category: dto.category,
        pricing: dto.pricing ? dto.pricing.toLowerCase() : undefined,
        developerId: dto.developerId,
      },
      include: {
        developer: true,
      },
    });

    return {
      message: "Aplicativo atualizado com sucesso!",
      data: updated,
    };
  }

  async delete(id: number) {
    await this.findOne(id);

    await this.prisma.app.delete({
      where: { id },
    });

    return {
      message: "Aplicativo removido com sucesso!",
    };
  }

  async recalculateRating(appId: number) {
    const agg = await this.prisma.review.aggregate({
      where: { appId },
      _avg: { rating: true },
    });

    const averageRating = agg._avg.rating
      ? Math.round(agg._avg.rating * 10) / 10
      : 0.0;

    await this.prisma.app.update({
      where: { id: appId },
      data: { rating: averageRating },
    });

    return averageRating;
  }
}
