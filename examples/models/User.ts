import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from './Photo';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({
		length: 100
	})
	public name: string;

	@OneToMany(() => Photo, photo => photo.user)
	photos: Photo[];
}
