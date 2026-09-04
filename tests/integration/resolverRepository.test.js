const userRepository = require('../../backend/src/repositories/userRepository');
const propertyRepository = require('../../backend/src/repositories/propertyRepository');

jest.mock('../../backend/src/repositories/userRepository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByRoleFilter: jest.fn(),
  findContactCandidates: jest.fn(),
}));

jest.mock('../../backend/src/repositories/propertyRepository', () => ({
  findById: jest.fn(),
  findByLandlordId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  findAllWithFilter: jest.fn(),
}));

describe('integration: repository-backed resolver dependencies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the user repository for contact lookup', async () => {
    userRepository.findContactCandidates.mockResolvedValue([{ id: 'u2', firstName: 'Jane', lastName: 'Doe', role: 'landlord' }]);

    const result = await userRepository.findContactCandidates('u1', 'LANDLORD');

    expect(result).toHaveLength(1);
    expect(userRepository.findContactCandidates).toHaveBeenCalledWith('u1', 'LANDLORD');
  });

  it('uses the property repository for property read operations', async () => {
    propertyRepository.findById.mockResolvedValue({ id: 'p1', title: 'Example', viewCount: 2 });

    const property = await propertyRepository.findById('p1');

    expect(property.title).toBe('Example');
    expect(propertyRepository.findById).toHaveBeenCalledWith('p1');
  });
});
