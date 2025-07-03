const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const { resolvers } = require('../src/index');

// Mock Prisma Client
const mockPrisma = {
  joke: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

// Create test server
const createTestServer = () => {
  return new ApolloServer({
    typeDefs: fs.readFileSync(
      path.join(__dirname, '../src/schema.graphql'),
      'utf8'
    ),
    resolvers,
    context: {
      prisma: mockPrisma,
    }
  });
};

module.exports = {
  createTestServer,
  mockPrisma,
};
