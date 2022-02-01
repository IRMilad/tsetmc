FROM node:13.13.0-alpine3.11
RUN echo "getting os"
RUN echo "copying data"
COPY ./index.js /app/index.js
COPY package.json /app/package.json
RUN echo "getting deps"
WORKDIR /app
RUN npm i
RUN ls
RUN echo "startting app"
RUN chmod +x /app/index.js
ENTRYPOINT [ "/app/index.js" ]