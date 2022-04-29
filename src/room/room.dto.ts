import { IsArray, Length } from "class-validator";

export class RoomDto {
  @Length(1)
  name: string;
  @IsArray()
  membersId: string[];
}
