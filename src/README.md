# Project Setup and Debugging Guide

This README walks you through setting up the `uniplexa` project with Poetry, running the FastAPI application, and debugging it in Visual Studio Code.

---

## Prerequisites

- **Python**: 3.13 installed on your machine
- **Poetry**: installed globally (see [Poetry docs](https://python-poetry.org/docs/#installation))
- **VS Code**: with the official **Python** extension

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/uniplexa.git
cd uniplexa/src
```

---

## 2. Install Dependencies

Use Poetry to install all runtime and development dependencies (creates the virtual environment automatically):

```bash
poetry install
```

---

## 2.5. Configure Environment Variables

**⚠️ IMPORTANT:** This project uses environment variables for all sensitive credentials. You must set up a `.env` file before running the application.

### Step 1: Create `.env` file

Create a `.env` file in the `src/` directory:

```bash
cd src
cp .env.example .env  # If .env.example exists, or create manually
```

### Step 2: Set Required Environment Variables

Edit the `.env` file and fill in your actual credentials. **Never commit the `.env` file to version control.**

Required variables:

```bash
# JWT Configuration (REQUIRED)
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256

# Database Configuration
DATABASE_URL=sqlite:///./test.db

# Application Configuration
BASE_URL=http://localhost:8000

# SMTP Email Configuration (Required for email functionality)
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_SERVER=smtp.hostinger.com
SMTP_PORT=465

# OpenAI API Configuration (Required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Password Reset & Signup Links
SIGN_UP_LINK=https://example.com/set_password
PASSWORD_RESET_LINK=https://example.com/reset_password
PASSWORD_RESET_TIME=5
NEW_USER_TOKEN_EXPIRE_MINUTES=5
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Security Best Practices

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use strong, unique values** for `SECRET_KEY` in production
3. **Rotate credentials regularly** especially if exposed
4. **Use different credentials** for development, staging, and production
5. **Store production secrets** in a secure secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)

### Environment Variable Priority

The application loads configuration in this order (highest priority first):
1. Environment variables (from `.env` file or system environment)
2. `config.json` file (for non-sensitive defaults)
3. Hardcoded defaults (only for non-sensitive values)

---

## 3. Install Poetry Shell Plugin (Optional but Recommended)

To enable the `poetry shell` command, install the shell plugin:

```bash
poetry self add poetry-plugin-shell
```

## 4. Activate the Poetry Shell (Optional)

To enter a shell with the project virtualenv on your `PATH`:

```bash
poetry shell
```

or use 

```bash 
 eval $(poetry env activate)   
 ```

You should see the venv prefix in your prompt, e.g.: `(uniplexa-py3.13) ➜ uniplexa`

> **Note:** You can skip manual activation if you always run commands via `poetry run ...`.
  
---

## 5. Run the Application Manually

If you want to start the server without debugging:

```bash
poetry run uvicorn main:app --reload --port 8000
```

- **--reload**: auto‑reload on code changes
- **--port 8000**: serve on [http://127.0.0.1:8000](http://127.0.0.1:8000)

Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the Swagger UI.

---

## 6. Visual Studio Code Debug Setup

1. **Open the `uniplexa` folder** in VS Code.

2. **Select the Poetry venv** as your interpreter:

   - Press `⇧⌘P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
   - Run **Python: Select Interpreter**
   - Choose the entry pointing to `uniplexa-...-py3.13/bin/python`

3. **Create `.vscode/launch.json`** in the project root with the following content:

   ```jsonc
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "FastAPI (Uvicorn) 🚀",
         "type": "python",
         "request": "launch",
         "python": "${config:python.interpreterPath}",
         "cwd": "${workspaceFolder}",
         "module": "uvicorn",
         "args": ["src.main:app", "--reload", "--port", "8000"],
         "console": "integratedTerminal",
         "justMyCode": true,
         "subProcess": true,
         "env": {
           "PYTHONPATH": "${workspaceFolder}/src"
         }
       }
     ]
   }
   ```

- **`subProcess: true`** ensures the debugger follows Uvicorn’s reload child process.
- **`PYTHONPATH`** points to `src/` so imports like `common.database` resolve correctly.

---

## 7. Debugging the Application

1. In VS Code, go to the **Run and Debug** sidebar (`⇧⌘D` / `Ctrl+Shift+D`).
2. Select **FastAPI (Uvicorn) 🚀** from the dropdown.
3. Press ▶️ **Start Debugging** (or F5).
4. **Set breakpoints** by clicking in the gutter next to any line in your router or handler code.
5. **Trigger your endpoint**:

   - Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) → **Try it out** → **Execute**
   - Or use `curl` / HTTPie:

     ```bash
     curl -X POST http://127.0.0.1:8000/your-endpoint \
          -H "Content-Type: application/json" \
          -d '{"key":"value"}'
     ```

Execution will pause at your breakpoints. Use the Debug sidebar to inspect variables, step over/into lines, and evaluate expressions in the Debug Console.

---

## 8. Running API Tests

The project includes an end-to-end test script (`test_api.py`) that validates all API endpoints.

### Prerequisites

Before running the tests, ensure:
1. The FastAPI server is running on `http://localhost:8000`
2. You have activated the Poetry environment (or use `poetry run`)

### Running the Tests

From the `src/` directory, run:

```bash
poetry run python test_api.py
```

Or if you're already in the Poetry shell:

```bash
python test_api.py
```

### Understanding Test Results

The test script will output detailed results for each endpoint:

- **✅ Success indicators**: Green checkmarks indicate passing tests
- **❌ Failure indicators**: Red X marks indicate failing tests
- **⚠️ Warnings**: Yellow warnings indicate partial failures or missing data

#### Test Coverage

The script tests the following endpoints:

1. **Basic Endpoints**
   - `GET /hello` - Health check endpoint

2. **User Management**
   - `POST /register` - User registration
   - `POST /login` - User authentication
   - `POST /add_user` - Add user without password
   - `POST /set_password` - Set password using signup token
   - `POST /verify_token` - Verify JWT token
   - `POST /forgot_password` - Request password reset
   - `POST /password-reset` - Reset password with token

3. **Service Requests**
   - `POST /service-request` - Create service request
   - `GET /service-request/{request_id}` - Get specific request
   - `GET /service-request/status/{request_id}` - Get request status
   - `GET /service-request/all` - Get all requests
   - `PATCH /service-requests/{request_id}` - Update request

4. **Other Endpoints**
   - `POST /agent/query` - Agent query endpoint
   - `POST /voice-summary` - Voice summary endpoint

### Expected Output

A successful test run will show:
- Status codes (200 for success, 4xx/5xx for errors)
- Response headers and body
- Parsed JSON responses
- Success/failure indicators for each test

### Troubleshooting

- **ModuleNotFoundError**: Ensure you're using `poetry run python` or are in the Poetry shell
- **Connection errors**: Verify the server is running on port 8000
- **Test failures**: Check the detailed error messages in the output for specific endpoint issues

---

## 9. Cleaning Up

- To exit the Poetry shell: `exit` or `Ctrl+D`
- To stop the server: `Ctrl+C` in the terminal

---

## Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Poetry Documentation](https://python-poetry.org/docs)
- [VS Code Python Debugging](https://code.visualstudio.com/docs/python/debugging)




Happy coding! 🎉
