# AI-OS Backend Architecture (Rebuild Prep)

This directory hosts the newly prepared, modular backend structure for the AI-OS platform. The architecture is designed to enforce separation of concerns, loose coupling, and clean coding principles.

## Target Modular Structure

```
backend/
├── prisma/                  # Database schemas, migrations, and seeds
├── src/
│   ├── config/              # App configurations (env, cors, DB connection params)
│   ├── controllers/         # Request handling layer (interacts with services)
│   ├── lib/                 # Core library initializers (Prisma, Razorpay, etc.)
│   ├── middleware/          # Auth guards, request loggers, rate limiters
│   ├── routes/              # Express API route mapping
│   ├── services/            # Pure business logic (e.g., Auth, Payments, AI generation)
│   ├── utils/               # Shared helpers and utility functions
│   ├── validators/          # Input schema validations (e.g., Zod, Joi)
│   └── app.js               # Express application bootsrapper & endpoint mapping
└── tests/                   # Automated unit & integration tests
```

## Architectural Guidelines

1. **Separation of Concerns**:
   - Keep controllers slim. They should only validate requests, invoke appropriate services, and return responses.
   - All core business operations (hashing, email delivery, payments, database access) must live inside `src/services/`.

2. **Loose Coupling**:
   - Utilize dependency injection or module-level service exports rather than hardcoding cross-dependencies.
   - Isolate external libraries (e.g., Razorpay, Prisma client) behind wrapper adapters in `src/lib/`.

3. **Validation & Security**:
   - Never trust user input. Use schemas in `src/validators/` to validate every request payload before hitting controller code.
   - Implement rate limiters on sensitive routes (auth, prompt creation) inside `src/middleware/`.

4. **Database Operations**:
   - Use the Prisma client singleton instantiated in `src/lib/db.js` for all database interactions.
