import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PropertyService {
  constructor(
    private prismaService:PrismaService,
  ) {}
  // async findOne(id: number) {
  //   const property = await this.prismaService.findOne({
  //     where: {
  //       id,
  //     },
  //   });

    
  //   if (!property) throw new NotFoundException();
  //   return property;
  // }
  // async findAll(paginationDTO: PaginationDTO) {
  //   return await this.prismaService.find({
  //     skip: paginationDTO.skip,
  //     take: paginationDTO.limit ?? DEFAULT_PAGE_SIZE,
  //   });
  // }
  // async create(dto: CreatePropertyDto) {
  //   return await this.prismaService.save(dto);
  // }
  // async update(id: number, dto: UpdatePropertyDto) {
  //   return await this.prismaService.update({ id }, dto);
  // }
  // async delete(id: number) {
  //   return await this.prismaService.delete({
  //     id,
  //   });
  // }
}
