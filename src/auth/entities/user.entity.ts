import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'users' })
export class User {

  @ApiProperty({ 
    example: '$2b$10$i9P.ox1BbpkmcRnVbfnEpeAp1P4JDATCvVNC6T0ygTBvsl3S4WnE.', 
    description: 'User id', 
    uniqueItems: true,
    type: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'ejp@mail.com', description: 'email',  type: String })
  @Column('text', { unique: true })
  email: string;

  @ApiProperty({ example: 'Abc123', description: 'password',  type: String })
  @Column('text', { select: false })
  password: string;

  @ApiProperty({ example: 'Alan', description: 'fullname',  type: 'uuid' })
  @Column('text')
  fullname: string;

  @ApiProperty({ example: true, description: 'isActive. Estado del user', default: true, type: 'boolean' })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({ example: 'admin, user', description: 'roles', default: 'user', type: 'string[]' })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  // uno a muchos
  @OneToMany(
    () => Product,
    (product) => product.user
  )
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
