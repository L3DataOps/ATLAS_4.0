import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_PASSWORD_LENGTH = 8;

/* ------------------------------------------------------------------ */
/* Default API calls (swap these out via props)                        */
/* ------------------------------------------------------------------ */

async function readError(res, fallback) {
  try {
    const data = await res.json();
    return data.message || data.error || fallback;
  } catch {
    return fallback;
  }
}

// Expects: POST /api/user/avatar (multipart, field "avatar") -> { avatarUrl }
async function defaultSavePhoto(file) {
  const body = new FormData();
  body.append("avatar", file);
  const res = await fetch("/api/user/avatar", {
    method: "POST",
    body,
    credentials: "include",
  });
  if (!res.ok)
    throw new Error(await readError(res, "Couldn't upload your photo."));
  return res.json();
}

// Expects: POST /api/user/password { currentPassword, newPassword }
async function defaultChangePassword({ currentPassword, newPassword }) {
  const res = await fetch("/api/user/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok)
    throw new Error(await readError(res, "Couldn't change your password."));
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Message({ state }) {
  if (!state) return null;
  return (
    <p
      className={`up-message up-message--${state.type}`}
      role={state.type === "error" ? "alert" : "status"}
    >
      {state.text}
    </p>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  describedBy,
  invalid,
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="up-field">
      <label htmlFor={id}>{label}</label>
      <div className="up-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
        <button
          type="button"
          className="up-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile photo                                                       */
/* ------------------------------------------------------------------ */

function PhotoSection({ user, onSavePhoto, onPhotoSaved }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(user.avatarUrl || null);

  // Create / clean up the object URL for the preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(candidate) {
    setMessage(null);
    if (!candidate) return;
    if (!PHOTO_TYPES.includes(candidate.type)) {
      setMessage({ type: "error", text: "Use a JPG, PNG or WebP image." });
      return;
    }
    if (candidate.size > MAX_PHOTO_BYTES) {
      setMessage({
        type: "error",
        text: "That image is over 5 MB. Choose a smaller one.",
      });
      return;
    }
    setFile(candidate);
  }

  function cancel() {
    setFile(null);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function save() {
    if (!file) return;
    setSaving(true);
    setMessage(null);
    try {
      const result = await onSavePhoto(file);
      const url = result?.avatarUrl || preview;
      setCurrentUrl(url);
      onPhotoSaved?.(url);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMessage({ type: "success", text: "Profile photo updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Couldn't upload your photo.",
      });
    } finally {
      setSaving(false);
    }
  }

  const shown = preview || currentUrl;

  return (
    <section className="up-section" aria-labelledby="photo-heading">
      <div className="up-section-intro">
        <h2 id="photo-heading">Profile photo</h2>
        <p>
          Shown next to your name across the app. JPG, PNG or WebP, up to 5 MB.
        </p>
      </div>

      <div className="up-section-body">
        <div
          className={`up-drop ${dragging ? "is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
        >
          <div className="up-avatar" aria-hidden={!shown}>
            {shown ? (
              <img src={shown} alt={`${user.name}'s profile photo`} />
            ) : (
              <span>{initialsOf(user.name)}</span>
            )}
          </div>

          <div className="up-drop-copy">
            <p className="up-drop-title">
              {file ? file.name : "Drop a photo here"}
            </p>
            <p className="up-drop-sub">
              {file
                ? "Preview only. Save to apply it."
                : "or choose one from your device"}
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            className="up-file"
            id="photo-input"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <label htmlFor="photo-input" className="up-btn up-btn--ghost">
            {file ? "Choose another" : "Choose photo"}
          </label>
        </div>

        <div className="up-actions">
          <button
            type="button"
            className="up-btn up-btn--primary"
            onClick={save}
            disabled={!file || saving}
          >
            {saving ? "Saving…" : "Save photo"}
          </button>
          {file && !saving && (
            <button
              type="button"
              className="up-btn up-btn--text"
              onClick={cancel}
            >
              Cancel
            </button>
          )}
        </div>
        <Message state={message} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Password                                                            */
/* ------------------------------------------------------------------ */

function PasswordSection({ onChangePassword }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [touched, setTouched] = useState(false);

  const score = useMemo(() => scorePassword(next), [next]);
  const strengthText =
    next.length < MIN_PASSWORD_LENGTH
      ? STRENGTH_LABELS[0]
      : STRENGTH_LABELS[score];

  const errors = {
    current: !current ? "Enter your current password." : null,
    next:
      next.length < MIN_PASSWORD_LENGTH
        ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
        : next === current
          ? "Choose a password different from your current one."
          : null,
    confirm: confirm !== next ? "Passwords don't match." : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    setMessage(null);
    if (hasErrors) return;

    setSaving(true);
    try {
      await onChangePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setTouched(false);
      setMessage({ type: "success", text: "Password changed." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Couldn't change your password.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="up-section" aria-labelledby="password-heading">
      <div className="up-section-intro">
        <h2 id="password-heading">Password</h2>
        <p>Enter your current password, then choose a new one.</p>
      </div>

      <form className="up-section-body" onSubmit={submit} noValidate>
        <PasswordField
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          invalid={touched && !!errors.current}
          describedBy={touched && errors.current ? "err-current" : undefined}
        />
        {touched && errors.current && (
          <p className="up-error" id="err-current">
            {errors.current}
          </p>
        )}

        <PasswordField
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          invalid={touched && !!errors.next}
          describedBy="strength err-next"
        />
        <div className="up-strength" id="strength">
          <div
            className="up-meter"
            data-score={
              next ? (next.length < MIN_PASSWORD_LENGTH ? 0 : score) : -1
            }
          >
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className="up-strength-text">{next ? strengthText : ""}</span>
        </div>
        {touched && errors.next && (
          <p className="up-error" id="err-next">
            {errors.next}
          </p>
        )}

        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          invalid={touched && !!errors.confirm}
          describedBy={touched && errors.confirm ? "err-confirm" : undefined}
        />
        {touched && errors.confirm && (
          <p className="up-error" id="err-confirm">
            {errors.confirm}
          </p>
        )}

        <div className="up-actions">
          <button
            type="submit"
            className="up-btn up-btn--primary"
            disabled={saving}
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
        <Message state={message} />
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function UserPage({
  onSavePhoto,
  onChangePassword,
  onPhotoSaved,
}) {
  const { user, token } = useAuth();

  if (!user) return null; // or a loading/redirect state

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const savePhoto =
    onSavePhoto ??
    (async (file) => {
      const body = new FormData();
      body.append("avatar", file);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: authHeader, // don't set Content-Type; the browser sets the multipart boundary
        body,
      });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't upload your photo."));
      return res.json(); // { avatarUrl }
    });

  const changePassword =
    onChangePassword ??
    (async ({ currentPassword, newPassword }) => {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't change your password."));
    });

  console.log(user);

  return (
    <main className="up-page">
      <style>{css}</style>

      <header className="up-header">
        <h1>Atlas User Settings</h1>
        <p>
          Signed in as <strong>{user.name}</strong>
        </p>
      </header>

      <PhotoSection
        user={user}
        onSavePhoto={savePhoto}
        onPhotoSaved={onPhotoSaved}
      />
      <PasswordSection onChangePassword={changePassword} />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const css = `
.up-page {
  --paper: #f0f0f0;
  --surface: #ffffff;
  --ink: #1c2330;
  --muted: #5d6675;
  --line: #dcdfe5;
  --accent: #1f5f5b;
  --accent-ink: #ffffff;
  --accent-soft: #e3efee;
  --danger: #b3321f;
  --ok: #1f6b3a;
  --focus: #2b7de9;

  box-sizing: border-box;
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  color: var(--ink);
  background: var(--paper);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.up-page *, .up-page *::before, .up-page *::after { box-sizing: border-box; }

.up-header { margin-bottom: 40px; }
.up-header h1 { margin: 0 0 6px; font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; }
.up-header p { margin: 0; color: var(--muted); }
.up-header strong { color: var(--ink); font-weight: 600; }

.up-section {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid var(--line);
}
.up-section-intro h2 { margin: 0 0 6px; font-size: 1.0625rem; font-weight: 650; }
.up-section-intro p { margin: 0; color: var(--muted); font-size: 0.9rem; max-width: 34ch; }
.up-section-body { max-width: 460px; }

/* Photo */
.up-drop {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: var(--surface);
  border: 1.5px dashed var(--line);
  border-radius: 12px;
  transition: border-color 0.15s, background-color 0.15s;
}
.up-drop.is-dragging { border-color: var(--accent); background: var(--accent-soft); }

.up-avatar {
  flex: none;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 1.5rem;
}
.up-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

.up-drop-copy { flex: 1 1 140px; min-width: 0; }
.up-drop-title { margin: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.up-drop-sub { margin: 2px 0 0; color: var(--muted); font-size: 0.875rem; }

.up-file {
  position: absolute;
  width: 1px; height: 1px;
  opacity: 0;
  pointer-events: none;
}
.up-file:focus-visible + .up-btn { outline: 3px solid var(--focus); outline-offset: 2px; }

/* Fields */
.up-field { margin-bottom: 6px; }
.up-field label { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 600; }
.up-input-wrap { position: relative; }
.up-input-wrap input {
  width: 100%;
  height: 44px;
  padding: 0 64px 0 12px;
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.up-input-wrap input[aria-invalid="true"] { border-color: var(--danger); }
.up-input-wrap input:focus-visible { outline: 3px solid var(--focus); outline-offset: 1px; border-color: transparent; }
.up-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  padding: 6px 10px;
  font: inherit;
  font-size: 0.85rem;
  color: var(--accent);
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.up-toggle:focus-visible { outline: 3px solid var(--focus); }

/* Strength */
.up-strength { display: flex; align-items: center; gap: 12px; min-height: 20px; margin: 4px 0 16px; }
.up-meter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; width: 140px; }
.up-meter span { height: 4px; border-radius: 2px; background: var(--line); transition: background-color 0.2s; }
.up-meter[data-score="0"] span:nth-child(-n+1),
.up-meter[data-score="1"] span:nth-child(-n+1) { background: var(--danger); }
.up-meter[data-score="2"] span:nth-child(-n+2) { background: #c98a14; }
.up-meter[data-score="3"] span:nth-child(-n+3),
.up-meter[data-score="4"] span:nth-child(-n+4) { background: var(--ok); }
.up-meter[data-score="-1"] span { background: var(--line); }
.up-strength-text { font-size: 0.85rem; color: var(--muted); }

/* Buttons */
.up-actions { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
.up-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
}
.up-btn:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
.up-btn--primary { background: var(--accent); color: var(--accent-ink); }
.up-btn--primary:hover:not(:disabled) { filter: brightness(1.08); }
.up-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }
.up-btn--ghost { background: transparent; color: var(--ink); border-color: var(--line); }
.up-btn--ghost:hover { background: var(--accent-soft); }
.up-btn--text { background: none; color: var(--muted); padding: 0 8px; }
.up-btn--text:hover { color: var(--ink); }

/* Messages */
.up-error { margin: 0 0 12px; color: var(--danger); font-size: 0.85rem; }
.up-message { margin: 16px 0 0; font-size: 0.9rem; font-weight: 500; }
.up-message--error { color: var(--danger); }
.up-message--success { color: var(--ok); }

@media (max-width: 720px) {
  .up-page { padding: 32px 16px 72px; }
  .up-section { grid-template-columns: 1fr; gap: 20px; }
  .up-section-body { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  .up-page * { transition: none !important; }
}
`;
