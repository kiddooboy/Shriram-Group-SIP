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

    CREATE TABLE IF NOT EXISTS otp_sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile      TEXT    NOT NULL,
      otp         TEXT    NOT NULL,
      expires_at  INTEGER NOT NULL,
      verified    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_reg_emp  ON registrations(employee_id);
    CREATE INDEX IF NOT EXISTS idx_sip_emp  ON sip_intents(employee_id);
    CREATE INDEX IF NOT EXISTS idx_otp_mob  ON otp_sessions(mobile);
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

// ── OTP helpers ───────────────────────────────────────────────────────────────

/** Count OTPs sent to a mobile in the last N minutes (rate limiting) */
export function countRecentOtps(mobile: string, withinMinutes: number): number {
  const since = Math.floor(Date.now() / 1000) - withinMinutes * 60
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM otp_sessions WHERE mobile = ? AND created_at >= datetime(?, \'unixepoch\')')
    .get(mobile, since) as { cnt: number }
  return row.cnt
}

/** Create a new OTP session */
export function createOtpSession(mobile: string, otp: string, expiryMinutes: number): void {
  const expiresAt = Math.floor(Date.now() / 1000) + expiryMinutes * 60
  getDb()
    .prepare('INSERT INTO otp_sessions (mobile, otp, expires_at) VALUES (?, ?, ?)')
    .run(mobile, otp, expiresAt)
}

/** Verify OTP — returns success or an error string */
export function verifyOtpSession(mobile: string, otp: string): { success: boolean; error?: string } {
  const db = getDb()
  const now = Math.floor(Date.now() / 1000)
  const row = db
    .prepare('SELECT * FROM otp_sessions WHERE mobile = ? AND verified = 0 ORDER BY id DESC LIMIT 1')
    .get(mobile) as { id: number; otp: string; expires_at: number } | undefined

  if (!row)                    return { success: false, error: 'OTP not found — please request a new one.' }
  if (row.expires_at < now)    return { success: false, error: 'OTP has expired — please request a new one.' }
  if (row.otp !== otp)         return { success: false, error: 'Incorrect OTP — please try again.' }

  db.prepare('UPDATE otp_sessions SET verified = 1 WHERE id = ?').run(row.id)
  return { success: true }
}
