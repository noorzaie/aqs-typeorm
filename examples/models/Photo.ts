import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Photo {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({
		length: 100
	})
	public name: string;

	@Column('text')
	public description: string;

	@Column()
	public filename: string;

	@Column('smallint')
	public views: number;

	@Column()
	public isPublished: boolean;

	@ManyToOne(() => User, user => user.photos)
	user: User;
}
