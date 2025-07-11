# express-devguard

**Plug-and-play middleware suite for Express.js**  
Includes API request logging, rate-limiting, and request body validation — perfect for small to mid-scale API projects.

![NPM version](https://img.shields.io/npm/v/express-devguard?color=green)
![License](https://img.shields.io/npm/l/express-devguard)
![Downloads](https://img.shields.io/npm/dt/express-devguard)

---

## ✨ Features

- 📈 Pretty logging with optional redaction and file logging
- 🔐 Request validation with custom schema rules
- 🚫 Rate limiting based on IP and window

---

## 📦 Installation

```bash
npm install express-devguard
```

---
## Quick Start
```typescript
import express from "express";
import { apiLogger, rateLimiter, validateSchema } from "express-devguard";

const app = express();
app.use(express.json());

// Logger middleware
app.use(
  apiLogger({
    redact: ["password"], // Hides sensitive fields
    logToFile: true, // saves logs to 'requests.log'
  })
);

// Rate limiter
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Too much requests detected!!",
  })
);

// Schema validation
const schema = {
  username: {
    required: true,
    type: "string" as const,
    minLength: 3,
  },
  password: {
    required: true,
    type: "string" as const,
    minLength: 8,
  },
};

app.post("/login", validateSchema(schema), (req, res) => {
  res.send({ message: "Logged in" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

```

## ⚙️ API Reference

---

### `apiLogger(options)`

| Option        | Type       | Description                                |
|---------------|------------|--------------------------------------------|
| `redact`      | `string[]` | Keys to hide in request body logs          |
| `logToFile`   | `boolean`  | Whether to save logs to a file             |
| `logFilePath` | `string`   | Custom log file path (default: `requests.log`) |

---

### `rateLimiter(options)`

| Option      | Type     | Description                                |
|-------------|----------|--------------------------------------------|
| `windowMs`  | `number` | Time window in milliseconds                |
| `max`       | `number` | Max number of requests per IP per window   |
| `message`   | `string` | Response message when rate limit is hit    |

---

### `validateSchema(schema)`

Validates incoming `req.body` using custom rules.

#### Rule options per field:

| Rule        | Type                                  | Description                        |
|-------------|---------------------------------------|------------------------------------|
| `required`  | `boolean`                             | Whether the field is required      |
| `type`      | `"string"` \| `"number"` \| `"boolean"` | Expected type of the value         |
| `minLength` | `number`                              | Minimum string length              |
| `maxLength` | `number`                              | Maximum string length              |
| `min`       | `number`                              | Minimum numeric value              |
| `max`       | `number`                              | Maximum numeric value              |

---

## License
MIT