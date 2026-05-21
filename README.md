# snapdiff

> Command-line utility to diff JSON API responses across staging and production

---

## Installation

```bash
npm install -g snapdiff
```

---

## Usage

Compare a JSON API endpoint between staging and production:

```bash
snapdiff --prod https://api.example.com/users \
         --staging https://staging.api.example.com/users
```

### Options

| Flag | Description |
|------|-------------|
| `--prod` | Production API URL |
| `--staging` | Staging API URL |
| `--headers` | Path to a JSON file containing request headers |
| `--output` | Output format: `text` (default) or `json` |
| `--ignore` | Comma-separated list of keys to ignore in the diff |

### Example Output

```diff
{
-  "version": "1.4.2",
+  "version": "1.5.0",
   "status": "ok",
-  "featureFlags": {
-    "newDashboard": false
-  }
+  "featureFlags": {
+    "newDashboard": true
+  }
}
```

### Using a Headers File

```bash
snapdiff --prod https://api.example.com/orders \
         --staging https://staging.api.example.com/orders \
         --headers ./headers.json
```

```json
{
  "Authorization": "Bearer <token>",
  "Accept": "application/json"
}
```

---

## License

[MIT](LICENSE)