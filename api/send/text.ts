import { NowRequest, NowResponse } from '@now/node'
const amqp = require('amqplib')
const uuidv4 = require('uuid/v4')
const textSchema = require('../../schema/text')
const config = require('../../config/values')
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(textSchema)

export default (request: NowRequest, response: NowResponse) => {

    if (request.method === "OPTIONS") {
        response.json({})
        return
    }

    if (validate(request.body)) {

        var jobId = null

        amqp.connect(config.amqp_endpoint).then(function(conn) {
            return conn.createChannel().then(function(ch) {
                let q = 'display_queue'
                let ok = ch.assertQueue(q, {durable: false})
    
                return ok.then(function() {
                    let text = request.body.text

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
            })
            .then(function() {
                return conn.close()
            })
            .finally(function() { 
                response.json({ text: request.body.text, jobId: jobId })
            })
        }).catch(console.warn)

        
    }
    else {
        response.statusCode = 422
        response.json({ "error": "Invalid data" })
    }
}