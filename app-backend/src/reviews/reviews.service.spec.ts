import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { PrismaService } from "../database/prisma.service";
import { AppsService } from "../apps/apps.service";

describe("ReviewsService", () => {
  let service: ReviewsService;
  let prisma: {
    app: {
      findUnique: jest.Mock;
    };
    review: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };
  let appsService: {
    recalculateRating: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      app: {
        findUnique: jest.fn(),
      },
      review: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    appsService = {
      recalculateRating: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: AppsService,
          useValue: appsService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe("findByApp", () => {
    it("should throw NotFoundException if app does not exist", async () => {
      prisma.app.findUnique.mockResolvedValue(null);

      await expect(service.findByApp(99)).rejects.toThrow(NotFoundException);
    });

    it("should return paginated reviews (default 10) for an app", async () => {
      const mockApp = { id: 1, name: "Firefox" };
      const mockReviews = [
        {
          id: 1,
          name: "User 1",
          rating: 5,
          markdownText: "Great!",
          user: { id: 1, name: "User 1", email: "user1@test.com", profile: null },
        },
      ];

      prisma.app.findUnique.mockResolvedValue(mockApp);
      prisma.review.count.mockResolvedValue(15);
      prisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByApp(1, { page: 1, limit: 10 });

      expect(prisma.review.count).toHaveBeenCalledWith({
        where: { appId: 1 },
      });

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { appId: 1 },
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
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: mockReviews,
        meta: {
          total: 15,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      });
    });

    it("should correctly handle page 2 with custom offset", async () => {
      prisma.app.findUnique.mockResolvedValue({ id: 1 });
      prisma.review.count.mockResolvedValue(25);
      prisma.review.findMany.mockResolvedValue([]);

      const result = await service.findByApp(1, { page: 2, limit: 10 });

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
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
});
