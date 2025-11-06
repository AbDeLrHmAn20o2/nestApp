import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class AddBrandsToCategoryDto {
  @IsArray()
  @IsNotEmpty()
  @IsUUID("4", { each: true })
  brandIds: string[];
}
