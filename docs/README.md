# Wolf Studio Documentation

Complete documentation for Wolf Studio digital portfolio and business platform.

## 📚 Documentation Index

### Getting Started
- **[Environment Setup](setup/environment-setup.md)** - Complete environment configuration guide
- **[Database Setup](setup/database-setup.md)** - PostgreSQL schema and migrations
- **[Database Backups](setup/database-backups.md)** - Backup and restore procedures

### Migration to Azure
- **[Migration Summary](migration/migration-summary.md)** - Executive overview for Azure team
- **[Migration Toolkit Quickstart](migration/migration-toolkit-quickstart.md)** - Quick start guide
- **[Azure Migration Guide](migration/azure-migration-guide.md)** - Complete step-by-step guide (60+ pages)
- **[Pre-Flight Checklist](migration/pre-flight-checklist.md)** - Pre-migration validation
- **[Azure Storage Adapter](migration/azure-storage-adapter.md)** - Drop-in Supabase Storage replacement

### Deployment
- **[Deployment Guide](deployment/deployment-guide.md)** - Deploy to Vercel, AWS, Azure, Docker

### Security
- **[Security Implementation](security/security-implementation.md)** - Enterprise security features

## 🎯 Quick Navigation

### For Developers
Start here: [Environment Setup](setup/environment-setup.md)

### For Azure Migration Team
Start here: [Migration Summary](migration/migration-summary.md)

### For DevOps
Start here: [Deployment Guide](deployment/deployment-guide.md)

### For AI Assistants (Claude Code)
See: [CLAUDE.md](../CLAUDE.md) at project root

## 📂 Project Structure

```
wolf-studio/
├── README.md                    # Project overview
├── CLAUDE.md                   # AI assistant guide
│
├── docs/                       # 👈 All documentation (this folder)
│   ├── README.md              # This file
│   ├── setup/                 # Environment and database setup
│   ├── migration/             # Azure migration guides
│   ├── deployment/            # Deployment guides
│   └── security/              # Security documentation
│
├── app/                        # Next.js application
├── components/                 # React components
├── lib/                        # Core utilities
├── migration/                  # Azure migration toolkit
│   ├── scripts/               # Automated migration scripts
│   ├── lib/                   # Azure adapters
│   └── config/                # Environment templates
│
├── supabase/                   # Database schema
│   ├── migrations/            # SQL migration files
│   └── backups/               # Database backups
│
└── archive/                    # Historical files
    ├── cleanup-docs/          # Cleanup history
    ├── old-supabase-migration/ # Old migration scripts
    └── old-static-migration/  # Static-to-CMS migration docs
```

## 🔧 Common Tasks

### Development
```bash
npm run dev                 # Start development server
npm run build              # Production build
npm run lint               # ESLint checking
npm run test               # Run tests
```

### Database Operations
```bash
# Supabase (Current)
supabase db reset         # Reset local database
supabase db push          # Push migrations

# Azure Migration
cd migration
npm run migrate-all       # Run complete migration
```

### Testing
```bash
npm run test               # Jest unit tests
npm run test:e2e           # Cypress E2E tests
npm run test:playwright    # Playwright tests
npm run test:all          # Complete test suite
```

## 📖 Additional Resources

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Project Documentation
- **Main README**: [../README.md](../README.md) - Project overview and features
- **CLAUDE.md**: [../CLAUDE.md](../CLAUDE.md) - AI assistant instructions

## 🆘 Getting Help

### Documentation Issues
- Check the specific guide for your task above
- Review troubleshooting sections in each guide
- Check archived documentation for historical context

### Technical Support
- For environment setup: See [Environment Setup](setup/environment-setup.md)
- For database issues: See [Database Setup](setup/database-setup.md)
- For migration questions: See [Migration Summary](migration/migration-summary.md)
- For deployment issues: See [Deployment Guide](deployment/deployment-guide.md)

## 📝 Documentation Standards

All documentation in this folder follows these standards:
- **Markdown format** for consistency
- **Clear headings** for easy navigation
- **Code examples** where applicable
- **Troubleshooting sections** for common issues
- **Cross-references** to related documentation

## 🗂️ Archive

Historical documentation is preserved in `/archive/`:
- **cleanup-docs/** - Cleanup history and rationale
- **old-supabase-migration/** - Legacy migration scripts
- **old-static-migration/** - Static-to-CMS migration docs

These files are kept for reference but are no longer maintained.

---

**Last Updated**: November 2025
**Project**: Wolf Studio Digital Portfolio
**Version**: 1.0
**Status**: Active Development
