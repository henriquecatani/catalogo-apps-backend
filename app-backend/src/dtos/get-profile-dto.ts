export class GetProfileDTO {
  id: number = 0;
  userId: number = 0;
  fullName: string = "";
  birthDate: Date | null = new Date();
  avatarUrl: string | null = "";
  createdAt: Date = new Date();
}
