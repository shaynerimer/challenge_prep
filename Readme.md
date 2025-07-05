# SecureGive Code Challenge
## Dad Joke Generator

Thank you for the opportunity to participate in your code challenge!  In addition to basic CRUD functionality, I have designed this application to demonstrate some of the more powerful architectural patterns I have experience with.  I hope you enjoy your review of this witty demonstration of a seriously powerful architecture.
  
In particular:
- **Dapr** - Distributed Application Runtime for Observability and Abstracting Integrations
- **Xstate** - State Machines and Actors
- **Clerk**- Authentication
- **Langchain** + Gemini - Generative AI
- **ElasticStack** + Zipkin - Log Discovery and Distributed Tracing
- **Apollo + Prisma** - GraphQL Server and Database Operations

**Coding Challenge Requirements:**
1. Create a simple CRUD app (Create, Read, Update, and Delete)
2. You may pick any tool you choose but we recommend Scala, Javascript/Typescript (like Angular, React, Express), or ASP.NET Core. (Bonus points if you use Scala!)
3. You must write at least one unit test per CRUD operation
4. When completed, push your project to GitHub or Gitlab and reply here with a link to the repository


![App Screnshot](https://github.com/user-attachments/assets/ad87ffeb-e820-47b3-99c9-ed7aaf251543)

---

## Application Structure
This Dad Joke Generator is a distributed application running on the Dapr framework.  It consists of three distinct services, each with their own project folder combined in this repo.  
- **web_app** - A front-end UI build in Next.js that offers a landing page and an application portal for authenticated users.  Authentication is handled by Clerk.  Only select gmail accounts are allowed and sign-up is disabled.  
    Service-invoking Front-end components operate via server actions which interact with external services via the Dapr Service Invocation building block or Dapr bindings (in the case of direct GraphQL calls).

  
- **joke_generator** - A back-end Node.js service with a single /createJoke Express API endpoint.  Upon calling, the joke_generator service starts an Xstate actor which progresses through the following states:
   - Received
   - Validating
   - Generating
   - Completed / Failed  
   During the Generating step, the joke_generator service interacts with Google Gemini-2.5-Flash model using langchain for orchestration.  

- **graphql_engine** - A back-end Node.js service that uses Apollo to serve a graphQL API layer and Prisma to handle database operations.  For development purposes, SQLite is used as a database.  
All CRUD operation unit tests are performed in this service (see below for details).  
You can interact with the SQLite database directly using prisma studio by running:
```bash
npx prisma studio
```

### Architecture Diagram
![Architecture Diagram](https://github.com/user-attachments/assets/3ac64632-1596-46b1-9349-0ce1a7b82fdc)

---

## Running the Application
As the application relies on the Dapr framework, you must either run the application using self-hosted Dapr or deploy the application to a Kubernetes cluster configured for Dapr.

### Self Hosted Mode

1. Ensure you have the required prerequisites installed:  
    - Dapr CLI
    - Docker
    - Node.js
    - tmux (optional - if you intend to use the provided helper script)
2. Initialize a self-hosted Dapr environment following [Dapr's documentation](https://docs.dapr.io/operations/hosting/self-hosted/self-hosted-with-docker/)
3. Create a .env file in the joke_generator directory and set the following variables:
```
GOOGLE_API_KEY=<Your Google AI Studio API Key>
SIMULATE_AI=0  ## Change to 1 if you want to mock Google AI responses for testing purposes
```
4. Create a .env.local file in the web_app directory and set the following variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<Your Clerk Publishable Key>
CLERK_SECRET_KEY=<Your Clerk Secret Key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
```
5. Install dependencies for all services
```bash
cd graphql_engine; npm install
cd ../joke_generator; npm install
cd ../web_app; pnpm install
```
6. Migrate Development Database
```bash
cd ./graphql_engine/prisma
npx prisma migrate dev
```
7. Run the helper script run-self-hosted.sh (requires tmux)
```bash
./run-self-hosted.sh
```
8. Navigate to http://localhost:3000 to view the application



### Kubernetes Mode

1. Deploy a [kind cluster](https://kind.sigs.k8s.io/) following the [instructions here](./docs/cluster_setup.md)
2. **Under Construction** - Follow [Issue #8](https://github.com/shaynerimer/challenge_prep/issues/8) for updates

---

## Running Unit Tests

Unit testing for all CRUD operations is provided using Jest and Prisma Mocking (to ensure the application database is not impacted).  
Two test groups are provided:
- **Test Environment Validation** - Ensures the mock prisma environment is configured correctly and all resolvers have been copied from the production to test environment.  
- **CRUD Unit Tests** - Specific unit tests for all Create, Read, Update, and Delete operations

```bash
cd graphql_engine
npm test
```
