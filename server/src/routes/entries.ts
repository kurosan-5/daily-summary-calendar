import e, { Router, Request, Response } from 'express';
import { supabase } from '../index';
import { EntrySchema, type EntryWithEvaluation } from '../types/schemas';
import { generateAIEvaluation } from '../services/aiService';

const router = Router();

// POST /entries - Create or update entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = EntrySchema.parse(req.body);
    const { date, raw_text, meals } = validatedData;
    
    // Get user_id (for now, using a default user)
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    // Upsert entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .upsert({
        user_id,
        date,
        raw_text,
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (entryError) {
      console.error('Entry error:', entryError);
      return res.status(500).json({ error: 'Failed to save entry' });
    }

    // Start AI evaluation in background
    generateAIEvaluation(raw_text, meals)
      .then(async (evaluation) => {
        console.log('AI evaluation generated:', evaluation);
        
        // Delete existing evaluation for this entry
        await supabase
          .from('ai_evaluations')
          .delete()
          .eq('entry_id', entry.id);

        // Insert new evaluation
        const { error: evalError } = await supabase
          .from('ai_evaluations')
          .insert({
            entry_id: entry.id,
            summary: evaluation.summary,
            score: evaluation.score,
            went_out_level: evaluation.went_out_level,
            tags: evaluation.tags,
            places: evaluation.places,
            model: 'gemini-2.5-flash',
            prompt_version: 1
          });

        if (evalError) {
          console.error('AI evaluation save error:', evalError);
        }
      })
      .catch((error) => {
        console.error('AI evaluation generation error:', error);
      });

    res.status(202).json({
      message: 'Entry saved, evaluation pending',
      // entry_id: entry.id,
      evaluation_status: 'pending'
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// GET /entries?month=YYYY-MM - Get month entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    const { data, error } = await supabase
      .from('entries')
      .select(`
        date,
        breakfast,
        lunch,
        dinner,
        ai_evaluations(score, went_out_level)
      `)
      .eq('user_id', user_id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch entries' });
    }

    const entries = (data as any[]).map(entry => ({
      date: entry.date,
      score: entry.ai_evaluations?.score || null,
      went_out_level: entry.ai_evaluations?.went_out_level || null,
      meals: {
        breakfast: entry.breakfast,
        lunch: entry.lunch,
        dinner: entry.dinner
      }
    }));

    res.json(entries);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /entries/evaluations - Get all evaluations for user
router.get('/evaluations', async (req: Request, res: Response) => {
  try {
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('ai_evaluations')
      .select(`
        *,
        entries!inner(user_id)
      `)
      .eq('entries.user_id', user_id);

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch evaluations' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /entries/:date - Get specific date entry
router.get('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { data, error } = await supabase
      .from('entries')
      .select(`
        *,
        ai_evaluations(*)
      `)
      .eq('user_id', user_id)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Entry not found' });
      }
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch entry' });
    }

    const evaluation = data.ai_evaluations;

    res.json({
      entry: {
        date: data.date,
        raw_text: data.raw_text,
        meals: {
          breakfast: data.breakfast,
          lunch: data.lunch,
          dinner: data.dinner
        }
      },
      evaluation: evaluation ? {
        summary: evaluation.summary,
        score: evaluation.score,
        tags: evaluation.tags,
        places: evaluation.places,
        went_out_level: evaluation.went_out_level
      } : null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /entries/:date - Update entry text
router.put('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { raw_text } = req.body;
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (!raw_text || typeof raw_text !== 'string') {
      return res.status(400).json({ error: 'Raw text is required' });
    }

    // Update entry text
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .update({
        raw_text,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('date', date)
      .select();

    if (entryError) {
      console.error('Entry update error:', entryError);
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry text updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /entries/:date/re-evaluate - Re-evaluate entry with AI
router.post('/:date/re-evaluate', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get entry for this date
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', date)
      .single();

    if (entryError) {
      console.error('Entry lookup error:', entryError);
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Get meals data
    const meals = {
      breakfast: entry.breakfast,
      lunch: entry.lunch,
      dinner: entry.dinner
    };

    // Generate new AI evaluation
    const evaluation = await generateAIEvaluation(entry.raw_text, meals);
    
    // Delete existing evaluation for this entry
    await supabase
      .from('ai_evaluations')
      .delete()
      .eq('entry_id', entry.id);

    // Insert new evaluation
    const { error: evalError } = await supabase
      .from('ai_evaluations')
      .insert({
        entry_id: entry.id,
        summary: evaluation.summary,
        score: evaluation.score,
        tags: evaluation.tags,
        places: evaluation.places,
        went_out_level: evaluation.went_out_level
      });

    if (evalError) {
      console.error('Evaluation insert error:', evalError);
      return res.status(500).json({ error: 'Failed to save AI evaluation' });
    }

    res.json({ message: 'Entry re-evaluated successfully', evaluation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /entries/:date - Delete entry
router.delete('/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const user_id = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000000';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get entry for this date
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', date)
      .single();

    if (entryError) {
      console.error('Entry lookup error:', entryError);
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Delete AI evaluation first (foreign key constraint)
    await supabase
      .from('ai_evaluations')
      .delete()
      .eq('entry_id', entry.id);

    // Delete entry
    const { error: deleteError } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', user_id)
      .eq('date', date);

    if (deleteError) {
      console.error('Entry delete error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete entry' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
