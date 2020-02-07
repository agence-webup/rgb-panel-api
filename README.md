# rgb-panel-api

This API endpoint accepts `POST` requests containing JSON representations of drawings or simple text messages sent through [`rgb-panel-frontend`](https://github.com/agence-webup/rgb-panel-frontend).

Requests are validated and sent to a [RabbitMQ](https://rabbitmq.com) queue for processing by [`rgb-panel-worker`](https://github.com/agence-webup/rgb-panel-worker).

It was built with [Node.js](https://nodejs.org) and [Express.js](https://expressjs.org).

It can also be deployed to [ZEIT](https://zeit.co) as Serverless Functions. If you choose to deploy to ZEIT, the API won't use Express, but rather the TypeScript file in the `api` folder and the `now.json` file at the root of the project.

## Installation instructions

### Requirements
- Node.js & npm

### Clone the repo
```bash
git clone git@github.com:agence-webup/rgb-panel-api.git
```

### Install dependencies
```bash
npm install
```

### Configure AMQP endpoint
First, copy `config/values.sample.js` to `config/values.js`
```bash
cp config/values.sample.js config/values.js
```
Edit `values.js` and specify your AMQP endpoint.

> __Warning:__
Please note this project was made with RabbitMQ in mind. It might work on another type of AMQP endpoint as well, but we haven't tested this.

### Run

With Express
```bash
node app.js
```

With [now](https://zeit.co/download)
```bash
now dev
```

### Deploy with ZEIT Now
```bash
now deploy --prod
```

### Alternative: Docker

If wish to do so, you can run this API in a Docker container.

To do so, all you need to do is configure the AMQP endpoint and build the image.

```bash
docker built -t matrixapi .
```

You can now run the API with Docker while specifying the desired public port.

```bash
docker run -p 8080:3000 -d matrixapi
```