# Contributing

Thanks for your interest in contributing to Data Agent.

This project is early-stage and actively evolving, so small, focused
contributions are easiest to review.

## Before You Start

- Open an issue or discussion for larger changes.
- Keep changes focused on one problem at a time.
- Avoid committing secrets, private data, screenshots with credentials, or
  production-only configuration.
- Preserve existing behavior for current users unless the issue explicitly
  asks for a breaking change.

## Local Development

```sh
npm install
npm run dev
```

Before opening a pull request, run:

```sh
npm run lint
npm run build
```

## Pull Request Guidelines

- Explain what changed and why.
- Include screenshots for UI changes when helpful.
- Add or update tests where the change affects shared behavior.
- Mention any required Supabase migration or Edge Function deployment.
- Keep unrelated formatting or refactors out of the pull request.

## Security

Please follow `SECURITY.md` for vulnerability reports. Do not disclose security
issues in public issues or pull requests before maintainers have reviewed them.
