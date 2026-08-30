FROM apify/actor-node:20

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . ./

CMD ["node", "src/main.js"]
