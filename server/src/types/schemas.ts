import { z, ZodNullDef } from 'zod';

export const EntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  raw_text: z.string().max(2000),
  meals: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean()
  })
});

export const AIEvaluationSchema = z.object({
  summary: z.string().min(1).max(500),
  score: z.number().int().min(1).max(10),
  tags: z.array(z.string()).max(5),
  places: z.array(z.string()),
  went_out_level: z.number().int().min(0).max(3)
});

export type Entry = z.infer<typeof EntrySchema>;
export type AIEvaluation = z.infer<typeof AIEvaluationSchema>;

// Supabase query result types
export interface EntryWithEvaluation {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  ai_evaluations: {
    score: number;
  } | null;
}
