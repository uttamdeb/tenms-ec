import { mirror, mirrorEnabled } from './mirrorClient';

/**
 * Fire-and-forget write to the mirror Supabase project.
 * Failures are logged but never block the primary flow.
 */
function mirrorWrite(
  table: string,
  operation: 'insert' | 'upsert' | 'update',
  payload: Record<string, unknown> | Record<string, unknown>[],
  options?: { onConflict?: string; eqColumn?: string; eqValue?: unknown },
) {
  if (!mirrorEnabled || !mirror) return;

  const run = async () => {
    try {
      let query;
      if (operation === 'insert') {
        query = mirror.from(table).insert(payload);
      } else if (operation === 'upsert') {
        query = mirror.from(table).upsert(payload, options?.onConflict ? { onConflict: options.onConflict } : undefined);
      } else {
        // update — requires eq filter
        query = mirror.from(table).update(payload).eq(options!.eqColumn!, options!.eqValue!);
      }
      const { error } = await query;
      if (error) console.warn(`[mirror] ${operation} ${table}:`, error.message);
    } catch (err) {
      console.warn(`[mirror] ${operation} ${table} exception:`, err);
    }
  };

  run();
}

export function mirrorInsert(table: string, payload: Record<string, unknown> | Record<string, unknown>[]) {
  mirrorWrite(table, 'insert', payload);
}

export function mirrorUpsert(table: string, payload: Record<string, unknown> | Record<string, unknown>[], onConflict?: string) {
  mirrorWrite(table, 'upsert', payload, { onConflict });
}

export function mirrorUpdate(table: string, payload: Record<string, unknown>, eqColumn: string, eqValue: unknown) {
  mirrorWrite(table, 'update', payload, { eqColumn, eqValue });
}
