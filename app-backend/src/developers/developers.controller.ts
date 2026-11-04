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
import { DevelopersService } from "./developers.service";
import { CreateDeveloperDto } from "../dtos/create-developer-dto";
import { UpdateDeveloperDto } from "../dtos/update-developer-dto";
import { GetDevelopersQueryDto } from "../dtos/get-developers-query-dto";

@Controller("developers")
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  async create(@Body() dto: CreateDeveloperDto) {
    return await this.developersService.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetDevelopersQueryDto) {
    return await this.developersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.developersService.findOne(id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDeveloperDto,
  ) {
    return await this.developersService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.developersService.delete(id);
  }
}
