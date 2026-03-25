# Sequelize to Drizzle ORM Migration

## Overview

This project was migrated from **Sequelize ORM** to **Drizzle ORM** due to persistent issues with join tables and many-to-many relationships. Drizzle provides better type safety, more explicit query control, and resolved the join table problems we encountered with Sequelize.

### Migration Reason

The primary motivation for this migration was **join table management issues**:
- Inconsistent behavior with many-to-many relationships
- Difficulties managing join table data (GameControllers, GamePlatforms, GameGenres, GameTags)
- Type safety limitations with Sequelize
- Better control over complex queries with Drizzle

---

## Migration Steps Completed

### Step 1: Schema Conversion ✅

All Sequelize models were converted to Drizzle ORM schemas in a single file: `src/Models/schema.ts`

#### Converted Models:

1. **Users** → `users` table
2. **Roles** → `roles` table
3. **Games** → `games` table
4. **Statuses** → `statuses` table
5. **Languages** → `languages` table
6. **Controllers** → `controllers` table
7. **Platforms** → `platforms` table
8. **Genres** → `genres` table
9. **Tags** → `tags` table
10. **Carts** → `carts` table

#### Join Tables (Many-to-Many):

- `GameControllers` → `gameControllers` (Games ↔ Controllers)
- `GamePlatforms` → `gamePlatforms` (Games ↔ Platforms)
- `GameGenres` → `gameGenres` (Games ↔ Genres)
- `GameTags` → `gameTags` (Games ↔ Tags)
- `Library` → `library` (Users ↔ Games)
- `Comment` → `comments` (Users ↔ Games with rating)
- `Upload` → `uploads` (Users ↔ Games)
- `Order` → `orders` (Users ↔ Games)
- `GameCart` → `gameCart` (Carts ↔ Games)

#### Relations Defined:

All Sequelize relations were converted to Drizzle ORM relations:
- `belongsTo` → `one()`
- `hasMany` → `many()`
- `belongsToMany` → `many()` with explicit join tables

---

## Dependencies

### Installed Packages

```json
{
  "drizzle-orm": "^0.44.7",
  "drizzle-kit": "^0.31.7",
  "mysql2": "^3.15.3"
}
```

### Removed Packages

- `sequelize` (removed)
- All Sequelize-related dependencies

---

## Files Created

1. **`src/Models/schema.ts`**: All Drizzle ORM schemas in a single file
2. **`drizzle.config.ts`**: Drizzle Kit configuration
3. **`src/database-drizzle.ts`**: Database connection with automatic migration handling
4. **`drizzle/0000_closed_phantom_reporter.sql`**: Initial migration SQL
5. **`drizzle/0001_add_rating_to_comment.sql`**: Rating column migration

---

## Code Migration Examples

### Query Conversion

**Sequelize (Before):**
```typescript
const users = await User.findAll({ 
  include: [{ model: Role, as: 'role' }] 
});

const game = await Game.findOne({
  where: { id: gameId },
  include: [
    { model: Genre, through: GameGenre },
    { model: Platform, through: GamePlatform }
  ]
});
```

**Drizzle (After):**
```typescript
import { db } from './database-drizzle.js';
import { users, roles, games, genres, platforms, gameGenres, gamePlatforms } from './Models/schema.js';
import { eq } from 'drizzle-orm';

// Get users with roles
const usersWithRoles = await db
  .select()
  .from(users)
  .leftJoin(roles, eq(users.RoleId, roles.id));

// Get game with relations
const gameWithGenres = await db
  .select({ genre: genres })
  .from(gameGenres)
  .innerJoin(genres, eq(gameGenres.GenreId, genres.id))
  .where(eq(gameGenres.GameId, gameId));
```

### Insert with Relations

**Sequelize:**
```typescript
await game.addGenres([1, 2, 3]);
await game.addPlatforms([1, 2]);
```

**Drizzle:**
```typescript
// Insert game
const [newGame] = await db.insert(games).values({...});

// Insert relations
await db.insert(gameGenres).values(
  [1, 2, 3].map(id => ({ GameId: newGame.id, GenreId: id }))
);

await db.insert(gamePlatforms).values(
  [1, 2].map(id => ({ GameId: newGame.id, PlatformId: id }))
);
```

---

## Database Initialization

### Automatic Setup

The `database-drizzle.ts` file automatically:
1. Creates the database if it doesn't exist
2. Applies migrations from `drizzle/` directory
3. Handles "table already exists" errors gracefully

### Manual Migration

```bash
# Generate migrations from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push
```

---

## Key Differences

### Table Naming

- **Sequelize**: PascalCase (`Users`, `Games`)
- **Drizzle**: camelCase (`users`, `games`)

### Foreign Keys

- **Sequelize**: Defined in model associations
- **Drizzle**: Defined in relations, foreign keys in schema

### Type Safety

- **Sequelize**: Limited TypeScript inference
- **Drizzle**: Full type inference with `$inferSelect` and `$inferInsert`

### Timestamps

- **Sequelize**: Automatic `createdAt`/`updatedAt`
- **Drizzle**: Explicit `timestamp().defaultNow()` and `.onUpdateNow()`

---

## Benefits of Migration

1. **Resolved Join Table Issues**: Explicit control over join table operations
2. **Better Type Safety**: Full TypeScript inference for queries
3. **More Explicit Queries**: Clear SQL-like syntax
4. **Better Performance**: More control over query optimization
5. **Simpler Schema**: Single file for all schemas
6. **Easier Debugging**: Queries are more transparent

---

## Testing Credentials

### Test Users

1. **user1** (Standard User)
   - Email: `user1@sharegames.com`
   - Password: `user123`
   - Role: `user`

2. **dev1** (Developer)
   - Email: `dev1@sharegames.com`
   - Password: `dev123`
   - Role: `developer`

3. **admin** (Administrator)
   - Email: `admin@sharegames.com`
   - Password: `admin123`
   - Role: `admin`

4. **superadmin** (Super Administrator)
   - Email: `superadmin@sharegames.com`
   - Password: `super123`
   - Role: `superadmin`

---

## Verification

To verify the migration:

```bash
# Check database connection
npm run dev

# Verify relations
npm run check-relations

# Check data initialization
npm run init-data
```

---

## Notes

- All Sequelize model files were removed
- Database migrations are handled automatically on server start
- Join tables are now explicitly managed with better control
- Type safety is significantly improved with Drizzle's type inference
- The migration resolved all join table relationship issues
