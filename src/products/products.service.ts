import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  // patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); // creacion de la instancia del producto
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 1, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({ slug: term });
      const queryBuilder = this.productRepository.createQueryBuilder();

      product = await queryBuilder
        .where(
          'UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .getOne();
    }
    // return await this.productRepository.findOne({ where: {id: id} });//opc1
    // return await this.productRepository.findOne({ where: { id } });//opc2
    // const product = await this.productRepository.findOneBy({ term });
    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    if (!product) throw new NotFoundException(`Product id: ${id} not found`);
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.delete({ id });
  }

  private handleDBExceptions(error: any) {
    if (error.code === "23505") {
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`Error detail: ${error.detail}`);
      this.logger.error(`Error general: ${error}`);
      throw new BadRequestException(error.detail);
    } else {
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`Error detail: ${error.detail}`);
      this.logger.error(`Error general: ${error}`);
      throw new InternalServerErrorException("Unexpected error, check server logs");
    }
  }
}