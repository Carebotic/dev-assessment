# 🧪 Shift Planner Assessment

Build a weekly shift planner UI for a fictional EMS.

## Your Task

- Build a schedule table UI (Mon–Sun × 3 employees)
- Editable dropdowns for each cell: 'Early', 'Late', 'Off'
- Save button with:
  - Validation (max 5 shifts per employee)
  - Inline error messages or feedback
  - Console log of updated schedule

## Bonus

- Persist data in Supabase
- Use Tailwind CSS for styling

## Starter Includes

- Preconfigured project with Tailwind + TypeScript
- Types and employee data
- No component structure — up to you

## Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Create the following tables in the SQL editor:

```sql
-- Create employees table
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create shifts table
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  shift_type TEXT NOT NULL,
  UNIQUE(employee_id, day)
);
```

4. Copy your Supabase URL and anon key from Project Settings > API
5. Create a `.env.local` file in the root of the project with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```


## Getting Started

```bash
npm install
npm run dev
```

## Submission

- Create a pull request to this repo with title and description
- Ensure your code is clean and well-commented

Good luck and don't forget to have fun! 🎉
