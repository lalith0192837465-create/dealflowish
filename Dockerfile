# One container image, used by every cloud's deployment. This is the actual
# "product" that gets shipped into a customer's account — everything in
# infra/<cloud> is just "how do we run this image on their cloud."
FROM node:20-slim AS base
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
