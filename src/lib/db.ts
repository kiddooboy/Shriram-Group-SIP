import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// ── DB file path (project root / data / sip.db) ───────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
const DB_PATH = path.join(DATA_DIR, 'sip.db')

// ── Singleton connection ───────────────────────────────────────────────────────
let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

// ── Schema bootstrap ──────────────────────────────────────────────────────────
function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      mobile      TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS sip_intents (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id   TEXT    NOT NULL,
      fund_id       TEXT    NOT NULL,
      fund_name     TEXT    NOT NULL,
      suggested_sip INTEGER NOT NULL DEFAULT 500,
      status        TEXT    NOT NULL DEFAULT 'link_sent',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_reg_emp ON registrations(employee_id);
    CREATE INDEX IF NOT EXISTS idx_sip_emp ON sip_intents(employee_id);
  `)
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export interface RegistrationRow {
  id: number
  employee_id: string
  name: string
  mobile: string
  created_at: string
}

export interface SipIntentRow {
  id: number
  employee_id: string
  fund_id: string
  fund_name: string
  suggested_sip: number
  status: string
  created_at: string
}

/** Upsert a registration — re-insert on each login attempt */
export function insertRegistration(
  employeeId: string,
  name: string,
  mobile: string,
): RegistrationRow {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO registrations (employee_id, name, mobile)
    VALUES (?, ?, ?)
  `)
  const info = stmt.run(employeeId, name, mobile)
  return db.prepare('SELECT * FROM registrations WHERE id = ?').get(info.lastInsertRowid) as RegistrationRow
}

/** Save SIP intent after fund selection */
export function insertSipIntent(
  employeeId: string,
  fundId: string,
  fundName: string,
  suggestedSip = 500,
): SipIntentRow {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO sip_intents (employee_id, fund_id, fund_name, suggested_sip)
    VALUES (?, ?, ?, ?)
  `)
  const info = stmt.run(employeeId, fundId, fundName, suggestedSip)
  return db.prepare('SELECT * FROM sip_intents WHERE id = ?').get(info.lastInsertRowid) as SipIntentRow
}

/** List all registrations (admin / demo) */
export function listRegistrations(): RegistrationRow[] {
  return getDb().prepare('SELECT * FROM registrations ORDER BY id DESC LIMIT 100').all() as RegistrationRow[]
}

/** List all SIP intents (admin / demo) */
export function listSipIntents(): SipIntentRow[] {
  return getDb().prepare('SELECT * FROM sip_intents ORDER BY id DESC LIMIT 100').all() as SipIntentRow[]
}
