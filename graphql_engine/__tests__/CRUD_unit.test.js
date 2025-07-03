const { createTestServer, mockPrisma } = require('./test-server');
const { createTestClient } = require('apollo-server-testing');


/* -------- Begin Variable Setup ---------  */

let server, query, mutate;

beforeEach(() => {
    server = createTestServer();
    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;

    // Reset all mocks before each test
    jest.clearAllMocks();
});

afterEach(async () => {
    if (server) {
        await server.stop();
    }
});

/* Define Mock Data */
const mockJokes = [
{
    id: "2",
    joke: "Second joke",
    cheesiness: 0,
    predictability: 1,
    style: "question-and-answer",
    told: true,
    favorite: true,
    eyeRollResponse: 1,
    groanResponse: 2,
    selfLaughResponse: 0,
    createdAt: new Date('2025-07-03T10:00:00.000Z').toISOString()
},
{
    id: "1",
    joke: "First joke",
    cheesiness: 3,
    predictability: 3,
    style: "pun",
    told: false,
    favorite: false,
    eyeRollResponse: 0,
    groanResponse: 0,
    selfLaughResponse: 0,
    createdAt: new Date('2025-07-03T09:00:00.000Z').toISOString()
}
];

const mockNewData =
  {
    id: "1",
    joke: "created joke",
    cheesiness: 2,
    predictability: 1,
    style: "misdirection",
    told: false,
    favorite: false,
    createdAt: new Date('2025-07-03T09:00:00.000Z').toISOString()
  };

const mockUpdateData = {
    id: "1",
    favorite: true,
    told: true
  };

const mockDeleteData = [
  {
    id: "1"
  },
  {
    id: "2"
  }
]

/* ----- End Variable setup ------ */



describe('CRUD Unit Tests', () => {

  describe('CREATE', () => {
    const CREATE_JOKE_MUTATION = `
          mutation CreateJoke($joke: String!, $cheesiness: Int!, $predictability: Int!, $style: String!) {
            createJoke(joke: $joke, cheesiness: $cheesiness, predictability: $predictability, style: $style) {
              id
              joke
              cheesiness
              predictability
              style
              told
              favorite
              createdAt
            }
          }
    `;

    it('should create a new joke with valid input', async () => {
      mockPrisma.joke.create.mockResolvedValue(mockNewData);

      const response = await mutate({
        mutation: CREATE_JOKE_MUTATION,
        variables: {
          joke: "created joke",
          cheesiness: 2,
          predictability: 1,
          style: "misdirection",
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.createJoke).toEqual(mockNewData);
    });

  it('should return an error if required parameters are not supplied (joke)', async () => {
      mockPrisma.joke.create.mockResolvedValue(mockNewData);

      const response = await mutate({
        mutation: CREATE_JOKE_MUTATION,
        variables: {
          cheesiness: 2,
          predictability: 1,
          style: "misdirection",
        }
      });

      expect(response.errors).toBeDefined();
    });

  it('should return an error if required parameters are of the wrong datatype (joke)', async () => {
      mockPrisma.joke.create.mockResolvedValue(mockNewData);

      const response = await mutate({
        mutation: CREATE_JOKE_MUTATION,
        variables: {
          joke: 1,                // Int provided, should be string
          cheesiness: 2,
          predictability: 1,
          style: "misdirection",
        }
      });

      expect(response.errors).toBeDefined();
  });
});

  describe('RETREIVE', () => {
    const JOKES_QUERY = `
      query {
        jokes {
          id
          joke
          cheesiness
          predictability
          style
          told
          favorite
          eyeRollResponse
          groanResponse
          selfLaughResponse
          createdAt
        }
      }
    `;

    it('should return all jokes ordered by createdAt desc', async () => {
      mockPrisma.joke.findMany.mockResolvedValue(mockJokes);

      const response = await query({
        query: JOKES_QUERY
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.jokes).toEqual(mockJokes);
      expect(mockPrisma.joke.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array when no jokes exist', async () => {
      mockPrisma.joke.findMany.mockResolvedValue([]);

      const response = await query({
        query: JOKES_QUERY
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.jokes).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrisma.joke.findMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await query({
        query: JOKES_QUERY
      });

      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toContain('Database connection failed');
    });
  });

  describe('UPDATE', () => {
    const UPDATE_JOKE_MUTATION = `
      mutation UpdateJoke($id: ID!, $joke: String, $cheesiness: Int, $predictability: Int, $style: String, $told: Boolean, $favorite: Boolean, $eyeRollResponse: Int, $groanResponse: Int, $selfLaughResponse: Int) {
        updateJoke(id: $id, joke: $joke, cheesiness: $cheesiness, predictability: $predictability, style: $style, told: $told, favorite: $favorite, eyeRollResponse: $eyeRollResponse, groanResponse: $groanResponse, selfLaughResponse: $selfLaughResponse) {
          id
          told
          favorite
        }
      }
    `;

    it('should update a joke with partial fields provided', async () => {

      mockPrisma.joke.update.mockResolvedValue(mockUpdateData);

      const response = await mutate({
        mutation: UPDATE_JOKE_MUTATION,
        variables: {
          id: "1",
          told: true,
          favorite: true,
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.updateJoke).toEqual(mockUpdateData);
    });

    it('should thrown an error when id is missing', async () => {

      mockPrisma.joke.update.mockResolvedValue(mockUpdateData);

      const response = await mutate({
        mutation: UPDATE_JOKE_MUTATION,
        variables: {
          told: true,
          favorite: true,
        }
      });

      expect(response.errors).toBeDefined();
    });
  });

  describe('DELETE', () => {
    const DELETE_JOKES_MUTATION = `
      mutation DeleteJokes($ids: [ID!]!) {
        deleteJokes(ids: $ids) {
          id
        }
      }
    `;

    it('should delete multiple jokes', async () => {

      mockPrisma.joke.findMany.mockResolvedValue(mockDeleteData);
      mockPrisma.joke.deleteMany.mockResolvedValue({ count: 2 });

      const response = await mutate({
        mutation: DELETE_JOKES_MUTATION,
        variables: {
          ids: ["1", "2"]
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.deleteJokes).toEqual(mockDeleteData);
      
      // Verify the jokes were deleted
      expect(mockPrisma.joke.deleteMany).toHaveBeenCalledWith({
        where: { 
          id: { 
            in: [1, 2] 
          } 
        }
      });
    });

    it('should delete a single joke', async () => {

      mockPrisma.joke.findMany.mockResolvedValue([mockDeleteData[1]]);
      mockPrisma.joke.deleteMany.mockResolvedValue({ count: 1 });

      const response = await mutate({
        mutation: DELETE_JOKES_MUTATION,
        variables: {
          ids: ["2"]
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.deleteJokes).toEqual([mockDeleteData[1]]);
      
      // Verify the jokes were deleted
      expect(mockPrisma.joke.deleteMany).toHaveBeenCalledWith({
        where: { 
          id: { 
            in: [2] 
          } 
        }
      });
    });

  })

});
