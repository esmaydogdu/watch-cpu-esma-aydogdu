This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
Load Monitoring Web Application

Showcase your front-end skills by creating a proof-of-concept (POC) for a browser-based CPU load monitoring application. This application will display time-series data, you're in charge of shaping the visual design of your application.

A POC Case study on a browser based CPU load monitor, 
It uses a NextJS app to send cpu information from nodeJS backend and opens an API point,
on the frontend it is using rechart to display time series data.

Each data point is defined as:

```
type DataPoint = {
  timestamp: string;
  loadAverage: number;
}
```
This information is polled in every 2 seconds using `useQuery` and the `DataPoint` is being processed, with `checkTransition` 

Latest dataPoints and alerts are persisted in the localstorage with cleanups to exclude stale data.



# Improvement Points

  - On production: using websocket connection, or serving the app from server (but can I have the graph in that case?)


# Creative extension ideas

  - Serving an HTML page from a Node.js environment that visualizes real-time CPU load changes through animated graphics updated in an infinite loop

  - Setting `--cpu-height` and `--cpu-color` CSS variables to render vertical bars on a canvas where **height** represents CPU load percentage and **color** indicates severity levels (green/yellow/red) across a 10-minute timeline
 

 

A user should be able to view your application to answer the following questions about their computer:

- What is my computer's current average CPU load?
- How did the average CPU load change over a 10 minute window?
- Has my computer been under heavy CPU load for 2 minutes or more? When? How many times?
- Has my computer recovered from heavy CPU load? When? How many times?

 

## Product requirements:

- The front-end application should communicate with a local back-end service to retrieve CPU load average information from your computer (see below).
- The front-end application should retrieve CPU load information every 10 seconds.
- The front-end application should maintain a 10 minute window of historical CPU load information.
- The front-end application should alert the user to high CPU load.
- The front-end application should alert the user when CPU load has recovered.

 

## Engineering requirements:

- The alerting logic in your application should have tests.
- The back-end service does not need to persist data.
- Please write up a small explanation of how you would extend or improve your application design if you were building this for production.


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
