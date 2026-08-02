# Contributing to NewsHub

We welcome contributions to the News Intelligence Platform! To ensure a smooth development process and clean history, please follow these guidelines.

---

## 🌿 Branching Strategy

Our branching model keeps deployment releases safe and stable:

*   `main`: Represents the production branch. Only stable, reviewed code is merged here.
*   `staging`: Pre-release integrations. Used to verify PaaS builds and run QA tests.
*   `feature/`: New features (e.g. `feature/story-clustering`).
*   `bugfix/`: Resolving bugs or crashes (e.g. `bugfix/cors-origins`).
*   `hotfix/`: Emergency production patches directly targeting `main`.

---

## 📝 Commit Message Conventions

Commit messages must be formatted to explain the context of your change. We follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>
```

### Supported Types
*   `feat`: A new feature (e.g. `feat(api): add intelligence endpoint`).
*   `fix`: A bug patch (e.g. `fix(db): correct postgres pool connection leak`).
*   `docs`: Documentation changes (e.g. `docs(root): add contributing guide`).
*   `style`: Formatting updates without changing logic.
*   `refactor`: Code restructures that do not alter features.
*   `test`: Appending unit or integration tests.
*   `chore`: Tooling updates or dependency upgrades.

---

## 📥 Pull Request Checklist

Before submitting a Pull Request (PR), ensure your work is verified:
1.  **Run Linters**: Verify there are no syntax warnings.
2.  **Verify local build**: Execute `npm run build` inside the frontend directory.
3.  **Local Testing**: Run backend test triggers (`python -m pytest`).
4.  **No Committed Secrets**: Confirm you have not committed real API credentials.
