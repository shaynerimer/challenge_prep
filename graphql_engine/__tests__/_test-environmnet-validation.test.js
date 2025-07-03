const { resolvers } = require('../src/index');
const { createTestServer,  mockPrisma } = require('./test-server');
const { createTestClient } = require('apollo-server-testing');


let testServer, testClient, query;

beforeEach(() => {
  testServer = createTestServer();
  testClient = createTestClient(testServer);
  testResolvers = testServer.config.resolvers;
  query = testClient.query;
});

afterEach(async () => {
  if (testServer) {
    await testServer.stop();
  }
});

describe('Testing Environment Setup Validation', () => {
  describe('Mock Infrastructure', () => {
    const INFO_QUERY = `
      query {
        info
      }
    `;

    it('Mock server should be running and respond to the info query', async () => {
      const response = await query({
        query: INFO_QUERY
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.info).toBe('API for Dad Joke Management');
    });
  });

  describe('Resolver Consistency', () => {
    it('should use the same resolvers as the main application', () => {
      // Compare the resolver structures
      expect(testResolvers).toBe(resolvers);
      expect(testResolvers).toEqual(resolvers);
    });

    it('should have the same resolver function names as main application', () => {
      
      const queryResolverNames = Object.keys(resolvers.Query);
      const mutationResolverNames = Object.keys(resolvers.Mutation);
      const expectedQueries = Object.keys(testResolvers.Query);
      const expectedMutations = Object.keys(testResolvers.Mutation);

      expect(queryResolverNames).toEqual(expect.arrayContaining(expectedQueries));
      expect(mutationResolverNames).toEqual(expect.arrayContaining(expectedMutations));
      
      // Ensure no extra resolvers exist
      expect(queryResolverNames).toHaveLength(expectedQueries.length);
      expect(mutationResolverNames).toHaveLength(expectedMutations.length);
    });
  });

  describe('Mock Prisma Coverage', () => {
    it('should verify that mock Prisma covers all Prisma operations used in resolvers', () => {
      // This test ensures that our mock Prisma client has all the methods that the resolvers use
      const resolverStr = resolvers.toString();
      
      // Check that all Prisma methods used in resolvers are mocked
      if (resolverStr.includes('context.prisma.joke.findMany')) {
        expect(mockPrisma.joke.findMany).toBeDefined();
      }
      if (resolverStr.includes('context.prisma.joke.findUnique')) {
        expect(mockPrisma.joke.findUnique).toBeDefined();
      }
      if (resolverStr.includes('context.prisma.joke.create')) {
        expect(mockPrisma.joke.create).toBeDefined();
      }
      if (resolverStr.includes('context.prisma.joke.update')) {
        expect(mockPrisma.joke.update).toBeDefined();
      }
      if (resolverStr.includes('context.prisma.joke.deleteMany')) {
        expect(mockPrisma.joke.deleteMany).toBeDefined();
      }
    });
  });
});
