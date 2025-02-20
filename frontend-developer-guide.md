# Frontend Developer Guide - Mobile Responsive Implementation

## Project Setup

1. Required Files (Copy these to a separate directory):
```
vueleaf-frontend/
├── src/
│   ├── components/
│   ├── views/
│   ├── assets/
│   └── styles/
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

2. Environment Setup:
- Create a .env.development file with:
```
VITE_API_BASE_URL=http://localhost:8000
```

3. Development Dependencies:
```bash
pnpm install
pnpm run dev
```

## Mobile Responsive Guidelines

1. Use Tailwind's responsive classes:
- sm: (640px)
- md: (768px)
- lg: (1024px)
- xl: (1280px)

2. Key Components for Mobile:
- Dashboard layouts
- Navigation menus
- Data tables
- Charts and graphs

3. Testing Requirements:
- Test on multiple device sizes
- Verify responsive breakpoints
- Ensure touch-friendly interfaces

## Security Notes

1. DO NOT modify:
- API endpoint configurations
- Authentication logic
- Production environment variables

2. Focus Areas:
- CSS/styling changes
- Component layouts
- Mobile-specific features
- Responsive design implementation

## Development Workflow

1. Run locally with:
```bash
pnpm run dev
```

2. Test responsive changes using browser dev tools
3. Implement mobile-first approach
4. Document any new mobile-specific components

## File Structure to Share

```
vueleaf-frontend/
├── src/
│   ├── components/     # UI components
│   ├── views/          # Page components
│   ├── assets/         # Images and static files
│   └── styles/         # CSS and Tailwind styles
├── public/            # Public assets
├── index.html         # Entry point
├── package.json       # Dependencies
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Getting Started

1. Copy the above files to a new directory
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm run dev`
4. Access the site at: http://localhost:5173

## Notes for Implementation

- Focus on mobile-first responsive design
- Use Tailwind's responsive utilities
- Test across different device sizes
- Document any new mobile components