# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js 14+ traceroute globe visualization web app with the following specifications:

## Project Overview
- **Theme**: Cyberpunk/hacker dark UI with black background and neon green colors
- **Technologies**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion, react-globe.gl
- **Purpose**: Visualize traceroute paths on a 3D globe with geolocation data

## UI Guidelines
- **Colors**: Only use black and neon green (#00ff00, #0f0)
- **Fonts**: Fira Code, JetBrains Mono (monospace fonts)
- **Style**: Terminal/console aesthetic with green glow effects
- **Responsive**: Must work on mobile and desktop

## Key Components
1. **TraceInput**: Input field for IP/domain with control buttons (Start, Stop, Clear, Next Hop)
2. **Globe**: 3D globe using react-globe.gl with animated arcs and points
3. **Legend**: Simple legend showing green colors for hops and current hop outline

## Backend
- API routes in Next.js using child_process.exec for traceroute
- Integration with ipinfo.io for IP geolocation
- Secure input sanitization to prevent shell injection

## Security
- Always sanitize user input before passing to shell commands
- Use environment variables for API tokens
- Implement proper error handling

## Animation
- Step-by-step path revelation using "Next Hop" button
- Smooth arc animations on the globe
- Hover tooltips with hop details (IP, location, hostname, latency)
