import { User } from 'src/users/entities/user.entity';

export class IUserRequest extends Request {
  user: User;
}
