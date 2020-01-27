import { NowRequest, NowResponse } from '@now/node'
const amqp = require('amqplib')
const uuidv4 = require('uuid/v4')
const textSchema = require('../../schema/text')
const drawingSchema = require('../../schema/drawing')
const config = require('../../config/values')
import Ajv from 'ajv'
const ajv = new Ajv()
const validateText = ajv.compile(textSchema)
const validateDrawing = ajv.compile(drawingSchema)

export default (request: NowRequest, response: NowResponse) => {

    response.setHeader("Access-Control-Allow-Origin", "*")
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

    if (request.method === "OPTIONS") {
        response.json({})
        return
    }

    const {
        query: { send }
    } = request

    // ZEIT shenanigans
    const type = send

    console.log(JSON.stringify(request.query))

    if (type !== "drawing" && type !== "message") {
        response.statusCode = 404
        response.json({})
        return
    }

    if (validateDrawing(request.body) || validateText(request.body)) {

        var jobId = null

        amqp.connect(config.amqp_endpoint).then(function(conn) {
            return conn.createChannel().then(function(ch) {
                let q = 'display_queue'
                let ok = ch.assertQueue(q, {durable: false})
    
                return ok.then(function() {
                    let data = ((type === "drawing") ? request.body.drawing : (type === "message") ? request.body.text : null)

                    // create a message object and specify type
                    let msg = null


                    if (type === "drawing") {
                        msg = {
                            type: 'drawing',
                            drawing: data,
                            jobId: uuidv4()
                        }
                    } else if (type === "message") {
                        msg = {
                            type: 'text',
                            text: data,
                            jobId: uuidv4()
                        }
                    }
    
                    ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)), {deliveryMode: true})
                    jobId = msg.jobId
    
                    console.log(`Sent message to queue with jobId: ${jobId}`)
                    return ch.close()
                })
            })
            .then(function() {
                return conn.close()
            })
            .finally(function() { 
                response.statusCode = 200
                if (type === "drawing") { 
                    response.json({ drawing: request.body.drawing, jobId: jobId })
                } else if (type === "message") {
                    response.json({ text: request.body.text, jobId: jobId })
                } else {
                    response.json({})
                }
            })
        }).catch(console.warn)

        
    }
    else {
        response.statusCode = 422
        response.json({ "error": "Invalid data" })
    }
}