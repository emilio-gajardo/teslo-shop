import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  // patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto, user: User) {
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user: user,
      }); // creacion de la instancia del producto

      await this.productRepository.save(product);

      return { ...product, images: images };

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true }
    });

    return products.map(
      (product) => ({
        ...product,
        images: product.images.map(img => img.url)
      }));
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({ slug: term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where(
          'UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect("prod.images", "prodImages")
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

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    if (!product) throw new NotFoundException(`Product id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      // vienen imagenes desde el cliente
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } }); // borrar imagenes pre-existentes
        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        );

        // no vienen imagenes desde el cliente
      } else {
        // TODO: product.images ?
      }

      product.user = user;
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);
      await queryRunner.commitTransaction(); // confirmacion de la operacion en la BD
      await queryRunner.release(); // termino de la conexion
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction(); // abortar la operacion en la BD
      await queryRunner.release(); // termino de la conexion
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}