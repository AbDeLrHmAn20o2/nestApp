import { IsNumber, IsNotEmpty, Min } from "class-validator";

export class UpdateQuantityDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
