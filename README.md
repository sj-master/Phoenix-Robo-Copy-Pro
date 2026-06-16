# 🔥 Phoenix RoboCopy Pro

### A modern, neon-themed automation suite built on top of Microsoft Robocopy.

Phoenix RoboCopy Pro transforms the raw Robocopy command-line tool into a **visual, beginner-friendly, automation-powered backup system** with presets, queueing, cloud uploads, history logs, and developer integrations.

It’s the Robocopy experience Windows should have had from the start.

---

## 📛 Badges

`https://img.shields.io/badge/version-1.0.0-pink`  
`https://img.shields.io/badge/platform-Windows-blue`  
`https://img.shields.io/badge/license-Custom-purple`  
`https://img.shields.io/badge/status-Active-success`

---

# ✨ Features

## 🚀 Quick-Access Backup Presets

Save complex Robocopy flag combinations and run them with a single click.

---

## 📜 Job History Log

Every backup is recorded with:

- Timestamps
- Backup status
- Execution details
- Generated HTML reports

---

## ☁️ Automatic Cloud Uploads

Send backup reports directly to:

- Google Drive
- OneDrive
- Dropbox

---

## 📦 Multi-Profile Queue Runner

Run multiple presets sequentially with live progress tracking.

Features:

- Queue management
- Reordering
- Multi-job execution
- Progress monitoring

---

## 🎓 Beginner Learning Mode

A full built-in course that teaches Robocopy step-by-step:

- What Robocopy is
- How flags work
- Safe backup practices
- Scheduling
- Logs and reports
- Advanced automation techniques

---

## 💻 Developer Hub

Includes:

- API documentation
- CLI examples
- PowerShell templates
- Batch automation scripts
- Integration guides

---

## 🧩 Easter Eggs + Developer Mini-Game

Hidden features include:

- Phoenix feathers
- Secret terminal
- Unlockable neon themes
- Developer surprises

---

# 📸 Screenshots

Replace these with real images once uploaded:

```text
/screenshots/home.png
/screenshots/presets.png
/screenshots/history.png
/screenshots/queue.png
/screenshots/learn.png
/screenshots/devhub.png
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/sj-master/Phoenix-Robo-Copy-Pro.git

cd Phoenix-Robo-Copy-Pro
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a file named:

```text
.env.local
```

Add:

```env
PHOENIX_APP_ID=your_app_id
PHOENIX_BACKEND_URL=https://your-backend-url
```

---

## Run The App

```bash
npm run dev
```

---

# 🧪 Usage

## Run A Preset

1. Open the **Presets** page
2. Select a preset
3. Click **Run Backup**

---

## Create A New Preset

Configure:

- Source folder
- Destination folder
- Robocopy flags
- Filters

Save and reuse anytime.

---

## Run Multiple Backups

Steps:

1. Add presets to queue
2. Arrange execution order
3. Start queue
4. Monitor live progress

---

# 📘 Developer API

## Run A Backup Job

```http
POST /api/jobs/run
```

Example:

```json
{
  "source": "C:\\Data",
  "destination": "D:\\Backup",
  "flags": [
    "/MIR"
  ]
}
```

---

## List Presets

```http
GET /api/presets/list
```

---

## Upload Backup Report

```http
POST /api/cloud/upload
```

Example:

```json
{
  "jobId": "j_001",
  "provider": "googleDrive"
}
```

---

# 🛣️ Roadmap

## Planned Features

- Full cloud backup support
- Email notifications
- Auto-repair mode
- AI-generated backup recommendations
- Enterprise multi-machine sync
- Advanced scheduling
- More automation tools

---

## Long-Term Vision

Phoenix RoboCopy Pro becomes the **ultimate Robocopy GUI** for:

- Windows power users
- Developers
- System administrators
- Small businesses

---

# 🤝 Contributing

Pull requests are welcome!

You can contribute:

- New preset templates
- UI improvements
- API extensions
- Documentation
- Bug fixes

---

# 📄 License

This project uses a custom Phoenix RoboCopy Pro license.

See:

```text
LICENSE
```

for details.

---

# 📬 Contact

For support or business inquiries:

📧 **phxit@icloud.com**
