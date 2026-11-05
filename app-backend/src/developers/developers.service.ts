import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateDeveloperDto } from "../dtos/create-developer-dto";
import { UpdateDeveloperDto } from "../dtos/update-developer-dto";
import { GetDevelopersQueryDto } from "../dtos/get-developers-query-dto";

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeveloperDto) {
    const developer = await this.prisma.developer.create({
      data: {
        name: dto.name,
        icon: dto.icon,
      },
    });

    return {
      message: "Desenvolvedor criado com sucesso!",
      data: developer,
    };
  }

  async findAll(query?: GetDevelopersQueryDto) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.name = { contains: query.search };
    }

    if (query?.includeApps) {
      const [total, developers] = await Promise.all([
        this.prisma.developer.count({ where }),
        this.prisma.developer.findMany({
          where,
          include: {
            apps: {
              select: {
                id: true,
                name: true,
                icon: true,
                rating: true,
                smallDescription: true,
                pricing: true,
              },
            },
          },
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: developers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    const [total, developers] = await Promise.all([
      this.prisma.developer.count({ where }),
      this.prisma.developer.findMany({
        where,
        include: {
          _count: {
            select: { apps: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
    ]);

    const data = developers.map((dev) => ({
      id: dev.id,
      name: dev.name,
      icon: dev.icon,
      createdAt: dev.createdAt,
      updatedAt: dev.updatedAt,
      app_count: dev._count.apps,
    }));

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
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        apps: {
          select: {
            id: true,
            name: true,
            icon: true,
            rating: true,
            smallDescription: true,
            pricing: true,
          },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException("Desenvolvedor não encontrado.");
    }

    return developer;
  }

  async update(id: number, dto: UpdateDeveloperDto) {
    await this.findOne(id);

    const updated = await this.prisma.developer.update({
      where: { id },
      data: {
        name: dto.name,
        icon: dto.icon,
      },
    });

    return {
      message: "Desenvolvedor atualizado com sucesso!",
      data: updated,
    };
  }

  async delete(id: number) {
    await this.findOne(id);

    await this.prisma.developer.delete({
      where: { id },
    });

    return {
      message: "Desenvolvedor removido com sucesso!",
    };
  }
}
