export class CreateTokenDto {
  _id: string;
  email: string;
}

export class ResultTokens {
  _id?: string;
  accessToken: string;
  refreshToken: string;
}
