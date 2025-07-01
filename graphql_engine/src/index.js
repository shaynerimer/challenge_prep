const { PrismaClient } = require('@prisma/client')
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient()

const resolvers = {
  Query: {
    info: () => `API for Order Management`,
    
    // Get all orders
    orders: async (parent, args, context) => {
      return context.prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      })
    },
    
    // Get order by ID
    orderById: async (parent, args, context) => {
      return context.prisma.order.findUnique({
        where: { id: parseInt(args.id) }
      })
    },
    
    // Get order by confirmation number
    orderByConfirmation: async (parent, args, context) => {
      return context.prisma.order.findUnique({
        where: { confirmationNumber: args.confirmationNumber }
      })
    },
  },
  
  Mutation: {
    // Create a new order
    createOrder: async (parent, args, context) => {
      const newOrder = await context.prisma.order.create({
        data: {
          productId: args.productId,
          orderQty: args.orderQty,
          confirmationNumber: args.confirmationNumber,
          status: args.status,
        },
      })
      return newOrder
    },
    
    // Update an existing order
    updateOrder: async (parent, args, context) => {
      const updateData = {};
      
      // Only include fields that were provided
      if (args.productId !== undefined) updateData.productId = args.productId;
      if (args.orderQty !== undefined) updateData.orderQty = args.orderQty;
      if (args.confirmationNumber !== undefined) updateData.confirmationNumber = args.confirmationNumber;
      if (args.status !== undefined) updateData.status = args.status;
      
      return context.prisma.order.update({
        where: { id: parseInt(args.id) },
        data: updateData,
      })
    },
    
    // Delete an order
    deleteOrder: async (parent, args, context) => {
      return context.prisma.order.delete({
        where: { id: parseInt(args.id) }
      })
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
