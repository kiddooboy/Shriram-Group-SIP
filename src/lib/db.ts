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

    -- Persistent journey: created right after fund selection. The resume_token
    -- is what the SMS link carries so the user can re-enter without re-auth.
    CREATE TABLE IF NOT EXISTS journeys (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_token    TEXT    NOT NULL UNIQUE,
      employee_id     TEXT    NOT NULL,
      name            TEXT    NOT NULL,
      mobile          TEXT    NOT NULL,
      fund_id         TEXT,
      fund_name       TEXT,
      suggested_sip   INTEGER NOT NULL DEFAULT 500,
      consent_status  TEXT    NOT NULL DEFAULT 'given',
      stage           TEXT    NOT NULL DEFAULT 'intent_captured',
      user_agent      TEXT,
      ip_address      TEXT,
      started_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- Incrementally saved KYC form state (single row per journey, JSON blob).
    CREATE TABLE IF NOT EXISTS kyc_drafts (
      journey_id  INTEGER PRIMARY KEY,
      data_json   TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
    );

    -- Final submitted KYC packet with reference number.
    CREATE TABLE IF NOT EXISTS kyc_submissions (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      journey_id        INTEGER NOT NULL,
      reference_number  TEXT    NOT NULL UNIQUE,
      data_json         TEXT    NOT NULL,
      status            TEXT    NOT NULL DEFAULT 'submitted',
      submitted_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reg_emp     ON registrations(employee_id);
    CREATE INDEX IF NOT EXISTS idx_sip_emp     ON sip_intents(employee_id);
    CREATE INDEX IF NOT EXISTS idx_otp_mob     ON otp_sessions(mobile);
    CREATE INDEX IF NOT EXISTS idx_jrny_mob    ON journeys(mobile);
    CREATE INDEX IF NOT EXISTS idx_jrny_token  ON journeys(resume_token);
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

// ── Journey helpers ───────────────────────────────────────────────────────────

export type JourneyStage =
  | 'intent_captured'
  | 'kyc_in_progress'
  | 'kyc_submitted'
  | 'completed'

export interface JourneyRow {
  id:              number
  resume_token:    string
  employee_id:     string
  name:            string
  mobile:          string
  fund_id:         string | null
  fund_name:       string | null
  suggested_sip:   number
  consent_status:  string
  stage:           JourneyStage
  user_agent:      string | null
  ip_address:      string | null
  started_at:      string
  updated_at:      string
}

function makeToken(): string {
  // 16-char URL-safe token (96 bits of entropy)
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

/** Create a journey row after intent capture, returning the resume token. */
export function createJourney(input: {
  employeeId:    string
  name:          string
  mobile:        string
  fundId:        string
  fundName:      string
  suggestedSip?: number
  consentStatus?: 'given' | 'withdrawn'
  userAgent?:    string | null
  ipAddress?:    string | null
}): JourneyRow {
  const db = getDb()
  const token = makeToken()
  const info = db.prepare(`
    INSERT INTO journeys
      (resume_token, employee_id, name, mobile, fund_id, fund_name,
       suggested_sip, consent_status, stage, user_agent, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'intent_captured', ?, ?)
  `).run(
    token,
    input.employeeId,
    input.name,
    input.mobile,
    input.fundId,
    input.fundName,
    input.suggestedSip ?? 500,
    input.consentStatus ?? 'given',
    input.userAgent ?? null,
    input.ipAddress ?? null,
  )
  return db.prepare('SELECT * FROM journeys WHERE id = ?').get(info.lastInsertRowid) as JourneyRow
}

export function getJourneyByToken(token: string): JourneyRow | null {
  const row = getDb()
    .prepare('SELECT * FROM journeys WHERE resume_token = ?')
    .get(token) as JourneyRow | undefined
  return row ?? null
}

export function updateJourneyStage(journeyId: number, stage: JourneyStage): void {
  getDb()
    .prepare(`UPDATE journeys SET stage = ?, updated_at = datetime('now','localtime') WHERE id = ?`)
    .run(stage, journeyId)
}

// ── KYC draft (incremental save) ─────────────────────────────────────────────

export interface KycDraftRow {
  journey_id: number
  data_json:  string
  updated_at: string
}

export function upsertKycDraft(journeyId: number, data: unknown): void {
  getDb().prepare(`
    INSERT INTO kyc_drafts (journey_id, data_json)
    VALUES (?, ?)
    ON CONFLICT(journey_id) DO UPDATE SET
      data_json  = excluded.data_json,
      updated_at = datetime('now','localtime')
  `).run(journeyId, JSON.stringify(data))
}

export function getKycDraft(journeyId: number): unknown | null {
  const row = getDb()
    .prepare('SELECT * FROM kyc_drafts WHERE journey_id = ?')
    .get(journeyId) as KycDraftRow | undefined
  if (!row) return null
  try { return JSON.parse(row.data_json) } catch { return null }
}

// ── KYC final submission ─────────────────────────────────────────────────────

export interface KycSubmissionRow {
  id:               number
  journey_id:       number
  reference_number: string
  data_json:        string
  status:           string
  submitted_at:     string
}

export function insertKycSubmission(journeyId: number, data: unknown): KycSubmissionRow {
  const db = getDb()
  const ref = `KYC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
  const info = db.prepare(`
    INSERT INTO kyc_submissions (journey_id, reference_number, data_json, status)
    VALUES (?, ?, ?, 'submitted')
  `).run(journeyId, ref, JSON.stringify(data))
  return db.prepare('SELECT * FROM kyc_submissions WHERE id = ?').get(info.lastInsertRowid) as KycSubmissionRow
}

export function getKycSubmissionByJourney(journeyId: number): KycSubmissionRow | null {
  const row = getDb()
    .prepare('SELECT * FROM kyc_submissions WHERE journey_id = ? ORDER BY id DESC LIMIT 1')
    .get(journeyId) as KycSubmissionRow | undefined
  return row ?? null
}
