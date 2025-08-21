FROM node:22.17

COPY src src

WORKDIR src

RUN npm run build

RUN apt update -y
RUN apt install dnsutils -y

EXPOSE 8080

ENTRYPOINT ["npm","start"]