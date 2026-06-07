# Security Policy

## Supported Versions

This project is in active development. Security fixes are handled on the main
branch unless a maintained release branch is created later.

## Reporting A Vulnerability

Please do not open a public issue for suspected vulnerabilities.

If you find a security issue, contact the maintainers privately with:

- A short description of the issue
- Steps to reproduce or a proof of concept
- The affected files, endpoints, or configuration
- Any suggested fix, if available

The maintainers will review the report, confirm impact, and coordinate a fix
before public disclosure where appropriate.

## Areas Of Interest

Extra care is needed around:

- Authentication and session handling
- Supabase Row Level Security policies
- Supabase Edge Functions and webhook verification
- Slack and Google Chat event handling
- n8n callback flows
- SQL generation, query execution, and result exposure
- Secret handling and environment configuration

## Secrets

Never commit `.env` files, service-role keys, bot tokens, signing secrets,
service-account JSON, or production webhook URLs that should not be public.
