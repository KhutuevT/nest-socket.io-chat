import { IsNotEmpty } from 'class-validator';
import { Tag } from 'src/message/schemas/message.schema';

export class RoomIdDto {
  @IsNotEmpty()
  roomId: string;
}

export class MessageDto extends RoomIdDto {
  @IsNotEmpty()
  text: string;

  tags?: Tag[];
  voice?: string;
}

export class DeleteUserDto extends RoomIdDto {
  @IsNotEmpty()
  userId: string;
}

export class AddUsersDto extends RoomIdDto {
  @IsNotEmpty()
  users: string[];
}

export class ChangeNameRoomDto extends RoomIdDto {
  @IsNotEmpty()
  name: string;
}

export class ChangeAvatarRoomDto extends RoomIdDto {
  @IsNotEmpty()
  avatar: string;
}

export class CreateRoomDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  users: string[];
}
