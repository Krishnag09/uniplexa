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
cd uniplexa
```

---

## 2. Install Dependencies

Use Poetry to install all runtime and development dependencies (creates the virtual environment automatically):

```bash
poetry install
```

---

## 3. Activate the Poetry Shell (Optional)

To enter a shell with the project virtualenv on your `PATH`:

```bash
poetry shell
```

You should see the venv prefix in your prompt, e.g.: `(uniplexa-py3.13) ➜ uniplexa`

> **Note:** You can skip manual activation if you always run commands via `poetry run ...`.

---

## 4. Run the Application Manually

If you want to start the server without debugging:

```bash
poetry run uvicorn src.main:app --reload --port 8000
```

- **--reload**: auto‑reload on code changes
- **--port 8000**: serve on [http://127.0.0.1:8000](http://127.0.0.1:8000)

Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the Swagger UI.

---

## 5. Visual Studio Code Debug Setup

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

## 6. Debugging the Application

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

## 7. Cleaning Up

- To exit the Poetry shell: `exit` or `Ctrl+D`
- To stop the server: `Ctrl+C` in the terminal

---

## Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Poetry Documentation](https://python-poetry.org/docs)
- [VS Code Python Debugging](https://code.visualstudio.com/docs/python/debugging)

Happy coding! 🎉
