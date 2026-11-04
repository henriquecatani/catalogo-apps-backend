import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AppsService } from "./apps.service";
import { CreateAppDto } from "../dtos/create-app-dto";
import { UpdateAppDto } from "../dtos/update-app-dto";
import { GetAppsQueryDto } from "../dtos/get-apps-query-dto";

@Controller("apps")
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  async create(@Body() dto: CreateAppDto) {
    return await this.appsService.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetAppsQueryDto) {
    return await this.appsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.appsService.findOne(id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAppDto,
  ) {
    return await this.appsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.appsService.delete(id);
  }
}
