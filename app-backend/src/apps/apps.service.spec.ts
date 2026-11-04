import { Test, TestingModule } from "@nestjs/testing";
import { AppsService } from "./apps.service";
import { PrismaService } from "../database/prisma.service";

describe("AppsService", () => {
  let service: AppsService;
  let prisma: {
    app: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    developer: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      app: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      developer: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AppsService>(AppsService);
  });

  describe("findAll", () => {
    it("should return paginated apps with default 10 apps ordered by rating desc and name asc", async () => {
      const mockApps = [
        {
          id: 1,
          name: "Firefox",
          icon: "icon.svg",
          smallDescription: "Fast browser",
          rating: 4.8,
          pricing: "free",
          developer: { id: 1, name: "Mozilla", icon: "dev.svg" },
        },
      ];

      prisma.app.count.mockResolvedValue(1);
      prisma.app.findMany.mockResolvedValue(mockApps);

      const result = await service.findAll();

      expect(prisma.app.count).toHaveBeenCalledWith({ where: {} });
      expect(prisma.app.findMany).toHaveBeenCalledWith({
        where: {},
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
        orderBy: [{ rating: "desc" }, { name: "asc" }],
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: mockApps,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should filter by category and pricing (e.g. Free Browsers) and compute totalPages", async () => {
      prisma.app.count.mockResolvedValue(25);
      prisma.app.findMany.mockResolvedValue([]);

      const result = await service.findAll({
        category: "Browsers",
        pricing: "free",
        page: 2,
        limit: 10,
      });

      expect(prisma.app.count).toHaveBeenCalledWith({
        where: {
          category: "Browsers",
          pricing: "free",
        },
      });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: "Browsers",
            pricing: "free",
          },
          skip: 10,
          take: 10,
          orderBy: [{ rating: "desc" }, { name: "asc" }],
        }),
      );

      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe("create", () => {
    it("should create an app with category and lowercase pricing", async () => {
      prisma.developer.findUnique.mockResolvedValue({ id: 1, name: "Mozilla" });
      prisma.app.create.mockResolvedValue({
        id: 1,
        name: "Firefox",
        category: "Browsers",
        pricing: "free",
      });

      const result = await service.create({
        name: "Firefox",
        icon: "icon.svg",
        link: "https://firefox.com",
        smallDescription: "A browser",
        markdownDescription: "# Firefox",
        category: "Browsers",
        pricing: "Free",
        developerId: 1,
      });

      expect(prisma.app.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: "Browsers",
          pricing: "free",
        }),
        include: { developer: true },
      });

      expect(result.message).toBe("Aplicativo cadastrado com sucesso!");
    });
  });
});
