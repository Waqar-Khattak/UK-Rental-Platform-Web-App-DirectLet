// Auth Service - Business Logic Layer
// Phase 1: Authentication and authorization

const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register(email, password, firstName, lastName, role) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    return { user, token: generateToken(user._id) };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    return { user, token: generateToken(user._id) };
  }
}

module.exports = new AuthService();
