import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProfileDto } from "../dtos/create-profile-dto";
import { PrismaService } from "../database/prisma.service";
import { UpdateProfileDto } from "../dtos/update-profile-dto";
import { GetProfileDTO } from "../dtos/get-profile-dto";

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new BadRequestException("Usuário não existe.");
    }
    const existing = await this.prisma.profile.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException("Usuário já possui um perfil.");
    }
    const profileCreated = await this.prisma.profile.create({
      data: {
        userId: dto.userId ?? 0,
        fullName: dto.fullName ?? "",
        birthDate: dto.birthDate ?? "",
        avatarUrl: dto.avatarUrl ?? "",
      },
    });
    return {
      message: "Perfil criado com sucesso!",
      data: profileCreated,
    };
  }

  async update(id: number, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException("Perfil não encontrado.");
    await this.prisma.profile.update({
      where: { id },
      data: {
        birthDate: dto.birthDate,
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  async findByUserId(userId: number) {
    const p = await this.prisma.profile.findUnique({ where: { userId } });
    if (!p)
      throw new NotFoundException("Perfil não encontrado para este usuário.");
    return {
      id: p.id,
      userId: p.userId,
      fullName: p.fullName,
      birthDate: p.birthDate?.toISOString(),
      avatarUrl: p.avatarUrl ?? "",
    };
  }

  async getAllProfiles(): Promise<GetProfileDTO[]> {
    return this.prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
        fullName: true,
        birthDate: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { fullName: "asc" },
    });
  }

  async findOne(id: number) {
    const p = await this.prisma.profile.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Perfil não encontrado.");
    return {
      id: p.id,
      userId: p.userId,
      fullName: p.fullName,
      birthDate: p.birthDate?.toISOString(),
      avatarUrl: p.avatarUrl ?? "",
    };
  }

  async deleteProfile(id: number): Promise<void> {
    await this.prisma.profile.delete({
      where: { id },
    });
  }
}
