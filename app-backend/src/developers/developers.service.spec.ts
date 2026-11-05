import { Test, TestingModule } from "@nestjs/testing";
import { DevelopersService } from "./developers.service";
import { PrismaService } from "../database/prisma.service";

describe("DevelopersService", () => {
  let service: DevelopersService;
  let prisma: {
    developer: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      developer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevelopersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<DevelopersService>(DevelopersService);
  });

  describe("findAll", () => {
    it("should return paginated developers with app_count instead of apps list by default", async () => {
      const mockDevelopersFromPrisma = [
        {
          id: 1,
          name: "Mozilla",
          icon: "mozilla.svg",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-02"),
          _count: { apps: 3 },
        },
      ];

      prisma.developer.count.mockResolvedValue(1);
      prisma.developer.findMany.mockResolvedValue(mockDevelopersFromPrisma);

      const result = await service.findAll();

      expect(prisma.developer.count).toHaveBeenCalledWith({ where: {} });
      expect(prisma.developer.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          _count: {
            select: { apps: true },
          },
        },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: [
          {
            id: 1,
            name: "Mozilla",
            icon: "mozilla.svg",
            createdAt: mockDevelopersFromPrisma[0].createdAt,
            updatedAt: mockDevelopersFromPrisma[0].updatedAt,
            app_count: 3,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should include nested apps if includeApps is true", async () => {
      const mockDevelopersWithApps = [
        {
          id: 1,
          name: "Mozilla",
          icon: "mozilla.svg",
          apps: [{ id: 1, name: "Firefox" }],
        },
      ];

      prisma.developer.count.mockResolvedValue(1);
      prisma.developer.findMany.mockResolvedValue(mockDevelopersWithApps);

      const result = await service.findAll({ includeApps: true });

      expect(prisma.developer.findMany).toHaveBeenCalledWith({
        where: {},
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
        skip: 0,
        take: 10,
      });

      expect(result.data).toEqual(mockDevelopersWithApps);
    });
  });

  describe("findOne", () => {
    it("should return developer with apps containing only essential fields", async () => {
      const mockDeveloper = {
        id: 1,
        name: "Mozilla",
        icon: "mozilla.svg",
        apps: [
          {
            id: 1,
            name: "Firefox",
            icon: "firefox.svg",
            rating: 4.8,
            smallDescription: "Fast browser",
            pricing: "free",
          },
        ],
      };

      prisma.developer.findUnique.mockResolvedValue(mockDeveloper);

      const result = await service.findOne(1);

      expect(prisma.developer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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

      expect(result).toEqual(mockDeveloper);
    });
  });
});
