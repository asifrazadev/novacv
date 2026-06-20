# Contributing to NovaCV

First off, thank you for considering contributing to NovaCV! It's people like you that make NovaCV such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Local Setup

This project uses **Turborepo** to manage its packages and apps.

1. **Fork and clone** the repository.
2. **Install dependencies** using npm:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Branch Naming

Please use descriptive branch names, such as:
- `feat/feature-name`
- `fix/issue-description`
- `docs/update-readme`


## Commit Message Format

We follow the Conventional Commits specification.
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `chore: maintenance tasks`

## Pull Request Process

1. Ensure all tests and linting pass (`npm run lint`).
2. Update documentation if necessary.
3. Submit a PR using the provided PR template.
4. Wait for a review from the maintainers.
