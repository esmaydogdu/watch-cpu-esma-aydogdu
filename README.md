# To run this project

```bash
npm install
# and
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Overview
This is a real-time CPU monitoring application built with Next.js and TypeScript. It provides:

  - Real-time CPU load monitoring with 2-second intervals

  - Time series visualization with alerts for high-load detection

  - Clean, simple interface for PoC



## Technical Approach

- Polling-based data fetching every 2 seconds

- Client-side state management with React hooks

- Modular CSS for clean look

- TypeScript for type safety

- Next.js to have server and client environments in a single codebase with API routes


## Extension Points

  - Adding new metrics (memory, disk etc)

  - Push notifications on certain custom thresholds in combination with different metrics

  - Adding different chart types

  - Graceful error handling showing different states based on error persistence

  - Using virtualized lists for big data sets

  - Using WebSockets instead of the polling logic

  - Service workers to improve resilience and caching

  - Database persistence for consistency across devices

  - Revamping the dashboard UI with a core component library

  - E2E tests to confirm alerting with UI reactivity with the real data.

  - Historical analysis, tracking the patterns, trends...


## Creative extension ideas

  - Serving an HTML page from a Node.js environment that visualizes real-time CPU load changes through animated graphics updated in an infinite loop

  - Setting `--cpu-height` and `--cpu-color` CSS variables to render vertical bars on a canvas where **height** represents CPU load percentage and **color** indicates severity levels (green/yellow/red) across a 10-minute timeline
 
