const { PrismaClient } = require('@prisma/client')
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient()

const resolvers = {
  Query: {
    info: () => `API for Dad Joke Management`,
    
    // Get all jokes
    jokes: async (parent, args, context) => {
      return context.prisma.joke.findMany({
        orderBy: { createdAt: 'desc' }
      })
    },
    
    // Get joke by ID
    jokeById: async (parent, args, context) => {
      return context.prisma.joke.findUnique({
        where: { id: parseInt(args.id) }
      })
    },
    
    // Get favorite jokes
    favoriteJokes: async (parent, args, context) => {
      return context.prisma.joke.findMany({
        where: { favorite: true },
        orderBy: { createdAt: 'desc' }
      })
    },
  },
  
  Mutation: {
    // Create a new joke
    createJoke: async (parent, args, context) => {
      const newJoke = await context.prisma.joke.create({
        data: {
          joke: args.joke,
          cheesiness: args.cheesiness,
          predictability: args.predictability,
          style: args.style,
        },
      })
      return newJoke
    },
    
    // Update an existing joke
    updateJoke: async (parent, args, context) => {
      const updateData = {};
      
      // Only include fields that were provided
      if (args.joke !== undefined) updateData.joke = args.joke;
      if (args.cheesiness !== undefined) updateData.cheesiness = args.cheesiness;
      if (args.predictability !== undefined) updateData.predictability = args.predictability;
      if (args.style !== undefined) updateData.style = args.style;
      if (args.told !== undefined) updateData.told = args.told;
      if (args.favorite !== undefined) updateData.favorite = args.favorite;
      if (args.eyeRollResponse !== undefined) updateData.eyeRollResponse = args.eyeRollResponse;
      if (args.groanResponse !== undefined) updateData.groanResponse = args.groanResponse;
      if (args.selfLaughResponse !== undefined) updateData.selfLaughResponse = args.selfLaughResponse;
      
      return context.prisma.joke.update({
        where: { id: parseInt(args.id) },
        data: updateData,
      })
    },
    
    // Delete multiple jokes
    deleteJokes: async (parent, args, context) => {
      const jokeIds = args.ids.map(id => parseInt(id));
      
      // First, get the jokes that will be deleted (to return them)
      const jokesToDelete = await context.prisma.joke.findMany({
        where: { 
          id: { 
            in: jokeIds 
          } 
        }
      });
      
      // Delete the jokes
      await context.prisma.joke.deleteMany({
        where: { 
          id: { 
            in: jokeIds 
          } 
        }
      });
      
      return jokesToDelete;
    },
  },
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: {
    prisma,
  }
})

server
  .listen()
  .then(({url}) => { console.log(`Apollo Server running on ${url}`) })
