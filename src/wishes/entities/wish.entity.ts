import { Length, Min, IsUrl, IsNotEmpty } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @Column()
  @IsUrl()
  @IsNotEmpty()
  link: string;

  @Column()
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @Column()
  @Min(1)
  @IsNotEmpty()
  price: number;
  // https://www.cloudhadoop.com/javascript-validate-decimalnumber/
  // стоимость подарка, с округлением до сотых, число.

  @Column({ default: 0 })
  @Min(0)
  raised: number;
  // сумма предварительного сбора или сумма, которую пользователи сейчас готовы скинуть на подарок. Также округляется до сотых.

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column({ default: 'Пользователь не оставил описание' })
  @Length(1, 1024)
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @Column({ default: 0 })
  copied: number;
  // содержит cчётчик тех, кто скопировал подарок себе. Целое десятичное число.
}
