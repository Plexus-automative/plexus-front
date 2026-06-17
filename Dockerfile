# Stage 1: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Copy the standalone build and static files from your LOCAL machine
# This requires you to run 'npm run build' locally first.
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Start the server
CMD ["node", "server.js"]
