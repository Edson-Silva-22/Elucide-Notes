export const mockProjectModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  exists: jest.fn()
}

export const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}

export const mockProjectAccessControlService = {
  createOwnerAccessControl: jest.fn()
}

export const mockProjectAccessControlModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

export const projectMock = {
  _id: '1',
  title: 'Projeto Teste',
  description: 'Descrição do projeto teste',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const createProjectDtoMock = {
  title: 'Projeto Teste',
  description: 'Descrição do projeto teste',
}

export const updateProjectDtoMock = {
  title: 'Projeto Teste Atualizado',
  description: 'Descrição do projeto teste atualizado',
}