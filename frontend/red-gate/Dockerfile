FROM node:18-alpine

# set working directory
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 5173
CMD ["npm", "run", "dev"]

# FROM nginx:1.19.0
# WORKDIR /usr/share/nginx/html
# COPY nginx.conf /usr/share/nginx/nginx.conf  
# RUN rm -rf ./*
# COPY --from=builder /app/build .
# ENTRYPOINT ["nginx", "-g", "daemon off;"]

# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app/build .
# RUN npm install -g serve

# EXPOSE 80
# CMD ["serve", "-s", ".", "-p", "80"]

# EXPOSE 4242
# CMD [ "npm", "run", "preview" ]