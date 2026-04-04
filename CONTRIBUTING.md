# Contributing to MCP Server Template

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## How to Submit Issues

1. Check the [existing issues](../../issues) to avoid duplicates.
2. Use a clear, descriptive title.
3. Include steps to reproduce the problem, expected behavior, and actual behavior.
4. Include your environment details (Node.js version, OS, transport mode).
5. Attach relevant logs or error messages.

## How to Submit Pull Requests

1. Fork the repository and create a feature branch from `main`.
2. Keep changes focused -- one feature or fix per PR.
3. Write clear commit messages that explain *why*, not just *what*.
4. Ensure all existing tests continue to pass.
5. Add tests for any new functionality.
6. Update documentation (README, inline comments) if your change affects usage.
7. Open the PR against `main` and fill in the description with a summary of changes.

## Coding Standards

- **TypeScript strict mode**: All code must compile under strict mode with no errors.
- **ESM modules**: Use ES module syntax (`import`/`export`), not CommonJS.
- **Error handling**: Use the standardized MCP error codes defined in `src/utils/errors.ts`. Never swallow errors silently.
- **Input validation**: Use Zod schemas for all tool and resource inputs.
- **Logging**: Use the structured Pino logger from `src/middleware/logging.ts`. Do not use `console.log`.
- **Formatting**: Run `npm run typecheck` before submitting to catch type errors.
- **Naming conventions**: Use camelCase for variables and functions, PascalCase for types and interfaces.
- **Keep dependencies minimal**: Propose new dependencies in the PR description with justification.

## Adding Tools and Resources

Follow the patterns in `src/tools/example.ts` and `src/resources/example.ts`. Each new tool or resource should have:

- A Zod schema for input validation
- Proper error handling with MCP error codes
- Documentation in the README

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
