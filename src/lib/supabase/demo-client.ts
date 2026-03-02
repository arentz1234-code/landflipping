/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Supabase client for demo mode
import {
  DEMO_USER,
  DEMO_TEAM_MEMBERS,
  DEMO_CONTACTS,
  DEMO_PROPERTIES,
  DEMO_DEALS,
  DEMO_TASKS,
  DEMO_ACTIVITY_LOG,
  DEMO_INVITATIONS,
} from '../demo-data';

type DemoTable = 'team_members' | 'contacts' | 'properties' | 'deals' | 'tasks' | 'activity_log' | 'invitations';

const DEMO_DATA: Record<DemoTable, any[]> = {
  team_members: DEMO_TEAM_MEMBERS,
  contacts: DEMO_CONTACTS,
  properties: DEMO_PROPERTIES,
  deals: DEMO_DEALS,
  tasks: DEMO_TASKS,
  activity_log: DEMO_ACTIVITY_LOG,
  invitations: DEMO_INVITATIONS,
};

// Simple query builder that mimics Supabase's API
class DemoQueryBuilder {
  private table: DemoTable;
  private data: any[];
  private filters: Array<{ field: string; value: any; op: string }> = [];
  private orderField: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isHead: boolean = false;
  private isCount: boolean = false;

  constructor(table: DemoTable) {
    this.table = table;
    this.data = [...(DEMO_DATA[table] || [])];
  }

  select(_fields: string = '*', options?: { count?: string; head?: boolean }) {
    if (options?.head) this.isHead = true;
    if (options?.count === 'exact') this.isCount = true;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value, op: 'eq' });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, value, op: 'neq' });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ field, value: values, op: 'in' });
    return this;
  }

  not(field: string, op: string, value: any) {
    // Parse value like '(closed_won,closed_lost,dead)' into array
    if (typeof value === 'string' && value.startsWith('(') && value.endsWith(')')) {
      const items = value.slice(1, -1).split(',');
      this.filters.push({ field, value: items, op: 'not_in' });
    } else {
      this.filters.push({ field, value, op: `not_${op}` });
    }
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(data: any | any[]) {
    const items = Array.isArray(data) ? data : [data];
    const newItems = items.map(item => ({
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item,
    }));
    DEMO_DATA[this.table].push(...newItems);
    return { data: newItems, error: null };
  }

  async update(data: any) {
    const filtered = this.applyFilters();
    filtered.forEach((item: any) => {
      Object.assign(item, data, { updated_at: new Date().toISOString() });
    });
    return { data: filtered, error: null };
  }

  async delete() {
    const toDelete = this.applyFilters();
    const ids = toDelete.map((item: any) => item.id);
    DEMO_DATA[this.table] = DEMO_DATA[this.table].filter(
      (item: any) => !ids.includes(item.id)
    );
    return { data: toDelete, error: null };
  }

  private applyFilters(): any[] {
    let result = [...this.data];

    for (const filter of this.filters) {
      result = result.filter((item: any) => {
        const fieldValue = item[filter.field];

        switch (filter.op) {
          case 'eq':
            return fieldValue === filter.value;
          case 'neq':
            return fieldValue !== filter.value;
          case 'in':
            return (filter.value as any[]).includes(fieldValue);
          case 'not_in':
            return !(filter.value as any[]).includes(fieldValue);
          default:
            return true;
        }
      });
    }

    return result;
  }

  then(resolve: (value: any) => any) {
    let result = this.applyFilters();

    // Apply ordering
    if (this.orderField) {
      const orderField = this.orderField;
      result.sort((a: any, b: any) => {
        const aVal = a[orderField];
        const bVal = b[orderField];
        if (aVal === undefined || aVal === null) return this.orderAsc ? 1 : -1;
        if (bVal === undefined || bVal === null) return this.orderAsc ? -1 : 1;
        if (aVal < bVal) return this.orderAsc ? -1 : 1;
        if (aVal > bVal) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount) {
      result = result.slice(0, this.limitCount);
    }

    // Handle count queries
    if (this.isCount) {
      return resolve({ data: null, error: null, count: result.length });
    }

    // Handle head queries
    if (this.isHead) {
      return resolve({ data: null, error: null, count: result.length });
    }

    // Handle single
    if (this.isSingle) {
      return resolve({ data: result[0] || null, error: null });
    }

    return resolve({ data: result, error: null });
  }
}

export function createDemoClient(): any {
  return {
    from: (table: string) => new DemoQueryBuilder(table as DemoTable),
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
          },
        },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ error: null }),
    },
  };
}
