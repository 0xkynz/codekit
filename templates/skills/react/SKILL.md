---
name: react
description: React development expert for Vite, TypeScript, shadcn/ui, TanStack (Query, Table, Router), forms, and state management. Use PROACTIVELY for React + Vite projects, SPAs, and client-side applications.
---

# React Development Expert

Expert in React development with Vite, TypeScript, and modern tooling. Specialized in building scalable single-page applications with best practices.

## When to Use

- React + Vite projects
- Single-page applications (SPAs)
- Client-side rendered applications
- Projects NOT using Next.js

For Next.js projects, use **nextjs** agent instead.

## Technology Stack

### Core
- **React 19**: Hooks, Suspense, transitions, useOptimistic
- **TypeScript**: Strict typing and best practices
- **Vite**: Fast build tool and dev server

### UI/Styling
- **shadcn/ui**: Component library
- **Radix UI**: Accessible primitives
- **TailwindCSS**: Utility-first styling
- **CVA**: Component variant management

### Data & State
- **TanStack Query**: Server state management
- **TanStack Router**: Type-safe routing
- **TanStack Table**: Headless data tables
- **Zustand**: Client state management
- **React Hook Form + Zod**: Form handling
- **TanStack Virtual**: Virtualized listsß

### Charts
- **Recharts**: Data visualization

## Project Structure

```
/my-react-app
├── /public/
├── /src/
│   ├── /assets/              # Static assets
│   ├── /components/          # Reusable components
│   │   ├── /ui/              # Base UI (Button, Input, Modal)
│   │   ├── /forms/           # Form components
│   │   └── /data-display/    # Tables, Cards, Charts
│   ├── /features/            # Feature modules
│   │   ├── /auth/
│   │   │   ├── /components/
│   │   │   ├── /hooks/
│   │   │   ├── /services/
│   │   │   └── index.ts
│   │   └── /dashboard/
│   ├── /hooks/               # Custom hooks
│   ├── /layouts/             # Layout components
│   ├── /pages/               # Page components
│   ├── /services/            # API services
│   ├── /store/               # State management
│   ├── /styles/              # Global styles
│   ├── /types/               # TypeScript types
│   ├── /utils/               # Utilities
│   ├── /config/              # Configuration
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Code Standards

### Component Pattern
```typescript
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
```

### Custom Hook Pattern
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Form Pattern (React Hook Form + Zod)
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### TanStack Router Setup
```typescript
// router.tsx
import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);

export const router = createRouter({ routeTree });
```

### Data Table Pattern
```typescript
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "status", header: "Status" },
];

export function UsersTable({ data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
```

## Best Practices

1. **Component Organization**
   - Use feature-based folder structure
   - Colocate related code (components, hooks, types)
   - Use barrel exports (index.ts)

2. **State Management**
   - Server state: TanStack Query
   - Client state: Zustand or Jotai
   - Form state: React Hook Form
   - URL state: TanStack Router

3. **Performance**
   - Use React.memo for expensive renders
   - Use useMemo/useCallback appropriately
   - Implement virtual scrolling for long lists
   - Lazy load routes and heavy components

4. **Styling**
   - Use Tailwind utilities
   - Use cn() for conditional classes
   - Follow shadcn/ui patterns
   - Support dark mode via CSS variables

5. **TypeScript**
   - Define interfaces for all props
   - Use strict mode
   - Avoid `any`, use `unknown` if needed
   - Use Zod for runtime validation

6. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Ensure keyboard navigation
   - Test with screen readers

## Quick Setup Commands

```bash
# Create new Vite + React project
npm create vite@latest my-app -- --template react-ts
cd my-app

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-router
npm install react-hook-form @hookform/resolvers zod
npm install zustand
npm install tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# Initialize Tailwind
npx tailwindcss init -p

# Add shadcn/ui
npx shadcn@latest init
```
