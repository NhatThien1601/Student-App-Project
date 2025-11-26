# Using node 21 alpine image
FROM node:21-alpine
# Working directory container
WORKDIR /app
# Copy file package.json 
COPY package.json ./
# Install dependencies
RUN npm install
# Copy source code 
COPY . .
# Create uploads directory
RUN mkdir -p uploads
# Open port
EXPOSE 3000
# Start App
CMD ["node", "server.js"]