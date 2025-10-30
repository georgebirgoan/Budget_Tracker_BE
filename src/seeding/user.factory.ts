import { User } from '../entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, (faker: any) => {
  const user = new User();
  user.name = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email();
  user.avatarUrl = faker.image.avatar();

  return user;
});
