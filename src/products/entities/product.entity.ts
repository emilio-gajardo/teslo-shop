import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {

  @ApiProperty({
    example: '45f8950c-acbf-4c27-9489-8bcd3e53714c',
    description: 'Product ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shit Teslo',
    description: 'Product Title',
    uniqueItems: true
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price'
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'lorem ipsum',
    description: 'Product description',
    default: null
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 't-shirt_teslo',
    description: 'Product SLUG',
    uniqueItems: true
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Product size'
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product gender'
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  // muchos a uno
  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true }
  )
  user: User;


  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(" ", "_")
      .replaceAll("'", "");
  }
}
