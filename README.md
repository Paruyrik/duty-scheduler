
# Scheduling Pro 📅

A professional Systems Administration & Operations Portal built with **Next.js**, **Electron**, and **Chakra UI**. 

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (Static Export), TypeScript, Chakra UI v3.
- **Desktop**: Electron (IPC Communication, Secure Main/Renderer separation).
- **State/Auth**: Custom IPC-based authentication system.

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/scheduling-pro.git](https://github.com/yourusername/scheduling-pro.git)
   cd scheduling-pro
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
To run the app in development mode (with Hot Module Replacement):
```bash
npm run dev

# 1. Clean previous builds
npm run clean

# 2. Export Next.js frontend to /dist/frontend
npm run build

# Cleans, builds frontend, and creates Mac distribution
npm run dist:mac
