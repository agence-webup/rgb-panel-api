const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const config = require('./config/values')
const uuidv4 = require('uuid/v4')
const cors = require('cors')

const { Validator, ValidationError } = require('express-json-validator-middleware')
const textSchema = require('./schema/text')
const drawingSchema = require('./schema/drawing')

const app = express()
const port = process.argv[2] || 3000 // get port number from command arg, else use 3000

const validator = new Validator({allErrors: true})
var validate = validator.validate

app.use(bodyParser.json())
app.use(cors())


app.post('/send/message', validate({body: textSchema}), (req, res) => {
    console.log(req.body)

    var jobId = null

    amqp.connect(config.amqp_endpoint).then(function(conn) {
        return conn.createChannel().then(function(ch) {
            let q = 'display_queue'
            let ok = ch.assertQueue(q, {durable: false})

            return ok.then(function() {
                let text = req.body.text
                // create a message object and specify type as text
                let msg = {
                    type: 'text',
                    text: text,
                    jobId: uuidv4()
                }

                ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)), {deliveryMode: true})
                jobId = msg.jobId

                console.log(`Sent message to queue with jobId: ${jobId}`)
                return ch.close()
            })
        }).finally(function() { conn.close() })
    }).catch(console.warn)

    res.send({
        message: req.body.text,
        length: req.body.text.length,
        jobId: jobId
    })
})

app.post('/send/drawing', validate({body: drawingSchema}), (req, res) => {
    console.log(req.body)

    var jobId = null

    amqp.connect(config.amqp_endpoint).then(function(conn) {
        return conn.createChannel().then(function(ch) {
            let q = 'display_queue'
            let ok = ch.assertQueue(q, {durable: false})

            return ok.then(function() {
                let drawing = JSON.stringify(req.body.drawing)
                // create a message object and specify type as drawing
                let msg = {
                    type: 'drawing',
                    drawing: drawing,
                    jobId: uuidv4()
                }

                ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)), {deliveryMode: true})
                jobId = msg.jobId

                console.log(`Sent drawing to queue with jobId: ${jobId}`)
                return ch.close()
            })
        }).finally(function() { conn.close() })
    }).catch(console.warn)

    res.send({
        drawing: req.body.drawing,
        jobId: jobId
    })
})

app.get('/status/:jobId', (req, res) => {
    res.send({
        jobId: req.params.jobId,
        status: 'TODO: implement job status checking'
    })
})



// Error handler for validation errors
app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(400).send({error: 'invalid input'});
        next();
    }
    else next(err); // pass error on to the next middleware if it isn't a validation error
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})