# Deployment Instructions for ProjectHub

## Quick Deploy to Vercel

### Prerequisites
1. Vercel account at https://vercel.com
2. GitHub repository connected

### Option 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository: `Delta-worker/projecthub`
3. Configure settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Click Deploy

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Environment Variables (if needed)
Create a `.env.local` file:
```
# Optional: For production features
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Current Repository
- GitHub: https://github.com/Delta-worker/projecthub
- Status: Code committed and pushed

## Next Steps
1. Anthony needs to log into Vercel and import the repo
2. Or provide Vercel authentication token
