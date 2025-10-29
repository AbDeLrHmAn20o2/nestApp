import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<User> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User> {
    return await this.repository.findOne({ where: { googleId } });
  }

  async findByEmailConfirmationToken(token: string): Promise<User> {
    return await this.repository.findOne({ where: { emailConfirmationToken: token } });
  }

  async findByPasswordResetToken(token: string): Promise<User> {
    return await this.repository.findOne({ 
      where: { passwordResetToken: token } 
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }
}
