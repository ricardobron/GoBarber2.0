// import AppError from '@shared/errors/App.error';

import AppError from '@shared/errors/App.error';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

import ResetPasswordService from './ResetPasswordService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeHashProvider: FakeHashProvider;
let resetPassword: ResetPasswordService;

describe('ResetPasswordService', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeHashProvider = new FakeHashProvider();

    resetPassword = new ResetPasswordService(
      fakeUsersRepository,
      fakeUserTokensRepository,
      fakeHashProvider
    );
  });

  it('should be able to reset the password ', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const { token } = await fakeUserTokensRepository.generate(user.id);

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash');

    await resetPassword.execute({
      token,
      password: '123123',
    });

    const updatedUser = await fakeUsersRepository.findById(user.id);

    expect(generateHash).toHaveBeenCalledWith('123123');

    expect(updatedUser?.password).toBe('123123');
  });

  it('should not be able to reset the password with no-existing token ', async () => {
    expect(
      resetPassword.execute({
        token: 'non-existing-token',
        password: '132456',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset the password with no-existing user ', async () => {
    const { token } = await fakeUserTokensRepository.generate(
      'non-existing-user'
    );

    expect(
      resetPassword.execute({
        token,
        password: '123456',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset the password if past more than 2 hours ', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const { token } = await fakeUserTokensRepository.generate(user.id);

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const custmonDate = new Date();

      return custmonDate.setHours(custmonDate.getHours() + 3);
    });

    await expect(
      resetPassword.execute({
        token,
        password: '123123',
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
