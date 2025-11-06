import { Injectable } from "@nestjs/common";
import { DataSource, Repository, LessThan } from "typeorm";
import { Token, TokenType } from "../entities/token.entity";

@Injectable()
export class TokenRepository extends Repository<Token> {
  constructor(private dataSource: DataSource) {
    super(Token, dataSource.createEntityManager());
  }

  async createToken(data: Partial<Token>): Promise<Token> {
    const token = this.create(data);
    return await this.save(token);
  }

  async findByToken(token: string): Promise<Token | null> {
    return await this.findOne({
      where: { token, isRevoked: false },
      relations: ["user"],
    });
  }

  async findByUserAndType(userId: string, type: TokenType): Promise<Token[]> {
    return await this.find({
      where: { userId, type, isRevoked: false },
    });
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.update(tokenId, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string, type?: TokenType): Promise<void> {
    const query: any = { userId, isRevoked: false };
    if (type) {
      query.type = type;
    }
    await this.update(query, { isRevoked: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async isTokenValid(token: string): Promise<boolean> {
    const tokenEntity = await this.findOne({
      where: { token, isRevoked: false },
    });

    if (!tokenEntity) {
      return false;
    }

    return tokenEntity.expiresAt > new Date();
  }
}
