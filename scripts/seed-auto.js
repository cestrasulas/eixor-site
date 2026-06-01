// scripts/seed-auto.js
import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
import dayjs from 'dayjs';

const { Client } = pkg;

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function parseDbUrl() {
  // pega DB URL do supabase status via env (recomendado setar manualmente)
  // formato: postgres://user:pass@host:port/db
  const raw = process.env.SUPABASE_DB_URL;
  if (!raw) {
    console.error('Defina SUPABASE_DB_URL (pegue do "supabase status")');
    process.exit(1);
  }
  return raw;
}

async function pgClient() {
  const client = new Client({ connectionString: parseDbUrl() });
  await client.connect();
  return client;
}

async function getCols(pg, table) {
  const q = `
    select column_name, data_type
    from information_schema.columns
    where table_schema='public' and table_name=$1
  `;
  const { rows } = await pg.query(q, [table]);
  return rows;
}

function has(cols, name) {
  return cols.some(c => c.column_name === name);
}

function uuid() {
  // gerado no DB via gen_random_uuid(); aqui só fallback
  return null;
}

async function createAuthUsers() {
  const users = [
    { email: 'dono1@local.test', password: '123456' },
    { email: 'dono2@local.test', password: '123456' },
    { email: 'dono3@local.test', password: '123456' },
  ];
  const created = [];
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (error) throw error;
    created.push(data.user);
  }
  return created;
}

async function seed() {
  const pg = await pgClient();

  // Descobrir tabelas base
  const tables = [
    'businesses',
    'services',
    'professionals',
    'professional_hours',
    'appointments',
    'profiles',
    'user_roles',
  ];

  const meta = {};
  for (const t of tables) {
    meta[t] = await getCols(pg, t).catch(() => []);
  }

  // 1) Auth users
  const users = await createAuthUsers();

  // 2) Businesses
  const bCols = meta.businesses;
  const canBusiness = bCols.length > 0;

  let businesses = [];
  if (canBusiness) {
    const rows = [];
    const names = ['Barbearia Alpha', 'Barbearia Beta', 'Barbearia Gama'];
    const slugs = ['alpha', 'beta', 'gama'];

    for (let i = 0; i < 3; i++) {
      const r = {};
      if (has(bCols, 'id')) r.id = uuid();
      if (has(bCols, 'name')) r.name = names[i];
      if (has(bCols, 'slug')) r.slug = slugs[i];
      if (has(bCols, 'owner_id')) r.owner_id = users[i]?.id ?? null;
      rows.push(r);
    }
    const { data, error } = await supabase.from('businesses').insert(rows).select();
    if (error) throw error;
    businesses = data;
  }

  // 3) Services
  const sCols = meta.services;
  let services = [];
  if (sCols.length && businesses.length) {
    const base = [
      { name: 'Corte', price: 50, duration_minutes: 30 },
      { name: 'Barba', price: 40, duration_minutes: 20 },
      { name: 'Corte + Barba', price: 80, duration_minutes: 50 },
    ];
    const rows = [];
    for (const b of businesses) {
      for (const s of base) {
        const r = {};
        if (has(sCols, 'id')) r.id = uuid();
        if (has(sCols, 'business_id')) r.business_id = b.id;
        if (has(sCols, 'name')) r.name = s.name;
        if (has(sCols, 'price')) r.price = s.price;
        if (has(sCols, 'duration_minutes')) r.duration_minutes = s.duration_minutes;
        rows.push(r);
      }
    }
    const { data, error } = await supabase.from('services').insert(rows).select();
    if (error) throw error;
    services = data;
  }

  // 4) Professionals
  const pCols = meta.professionals;
  let professionals = [];
  if (pCols.length && businesses.length) {
    const rows = [];
    for (const b of businesses) {
      for (const name of ['João', 'Pedro']) {
        const r = {};
        if (has(pCols, 'id')) r.id = uuid();
        if (has(pCols, 'business_id')) r.business_id = b.id;
        if (has(pCols, 'name')) r.name = name;
        rows.push(r);
      }
    }
    const { data, error } = await supabase.from('professionals').insert(rows).select();
    if (error) throw error;
    professionals = data;
  }

  // 5) Professional Hours (seg–sex 09–18)
  const phCols = meta.professional_hours;
  if (phCols.length && professionals.length) {
    const rows = [];
    for (const p of professionals) {
      for (let d = 1; d <= 5; d++) {
        const r = {};
        if (has(phCols, 'professional_id')) r.professional_id = p.id;
        if (has(phCols, 'day_of_week')) r.day_of_week = d;
        if (has(phCols, 'open_time')) r.open_time = '09:00';
        if (has(phCols, 'close_time')) r.close_time = '18:00';
        if (has(phCols, 'is_extra')) r.is_extra = false;
        rows.push(r);
      }
    }
    await supabase.from('professional_hours').insert(rows);
  }

  // 6) Appointments (~50 por business entre 01/04–30/04)
  const aCols = meta.appointments;
  if (aCols.length && businesses.length && professionals.length && services.length) {
    const start = dayjs('2026-04-01');
    const end = dayjs('2026-04-30');

    const rows = [];
    for (const b of businesses) {
      const pros = professionals.filter(p => p.business_id === b.id);
      const svcs = services.filter(s => s.business_id === b.id);

      let count = 0;
      while (count < 50) {
        const d = start.add(Math.floor(Math.random() * (end.diff(start, 'day') + 1)), 'day');
        const hour = 9 + Math.floor(Math.random() * 9); // 9–17
        const min = Math.random() < 0.5 ? 0 : 30;

        const p = pros[Math.floor(Math.random() * pros.length)];
        const s = svcs[Math.floor(Math.random() * svcs.length)];

        const r = {};
        if (has(aCols, 'id')) r.id = uuid();
        if (has(aCols, 'business_id')) r.business_id = b.id;
        if (has(aCols, 'professional_id')) r.professional_id = p?.id ?? null;
        if (has(aCols, 'service_id')) r.service_id = s?.id ?? null;

        if (has(aCols, 'client_name')) r.client_name = `Cliente ${Math.floor(Math.random()*1000)}`;
        if (has(aCols, 'client_phone')) r.client_phone = `5599${Math.floor(10000000 + Math.random()*89999999)}`;

        if (has(aCols, 'date')) r.date = d.format('YYYY-MM-DD');
        if (has(aCols, 'time')) r.time = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;

        if (has(aCols, 'start_at')) r.start_at = d.hour(hour).minute(min).toISOString();
        if (has(aCols, 'end_at')) {
          const dur = (s?.duration_minutes ?? 30);
          r.end_at = d.hour(hour).minute(min).add(dur, 'minute').toISOString();
        }

        if (has(aCols, 'status')) r.status = 'confirmed';

        rows.push(r);
        count++;
      }
    }
    // insere em lotes para evitar timeout
    const chunk = 200;
    for (let i = 0; i < rows.length; i += chunk) {
      const part = rows.slice(i, i + chunk);
      const { error } = await supabase.from('appointments').insert(part);
      if (error) throw error;
    }
  }

  // 7) Vincular roles/perfis (se existir)
  if (meta.profiles.length) {
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: u.id, role: 'owner' });
      if (error) throw error;
    }
  } else if (meta.user_roles.length) {
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: u.id, role: 'owner' });
      if (error) throw error;
    }
  }

  await pg.end();
  console.log('Seed concluído.');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});

