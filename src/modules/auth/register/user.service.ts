import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/register.dto.';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.UserRepo.update({ id: userId }, { hashedRefreshToken });
  }

  async create(createUserDto: CreateUserDto) {
  try {
    console.log("🟢 Received createUserDto:", createUserDto);

    const user = this.UserRepo.create(createUserDto);

    console.log("🧱 Creating User entity:", user);

    const savedUser = await this.UserRepo.save(user);
    console.log("✅ User successfully saved:", savedUser);

    return savedUser;
  } catch (error) {
    console.error("❌ User creation failed:", error);
    throw error;
  }
}



  async findByEmail(email: string) {
    return await this.UserRepo.findOne({
      where: {
        email,
      },
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    return this.UserRepo.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'lastName',
        'avatarUrl',
        'hashedRefreshToken',
        'role',
      ],
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
