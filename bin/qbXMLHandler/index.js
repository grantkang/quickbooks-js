/*
 * This file is part of quickbooks-js
 * https://github.com/RappidDevelopment/quickbooks-js
 *
 * Based on qbws: https://github.com/johnballantyne/qbws
 *
 * (c) 2015 johnballantyne
 * (c) 2016 Rappid Development LLC
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false, attrkey: '_attr'})
const util = require('util')

const QbsdkQueueItem = require('../../lib/models/qbsdk-queue-item');
const ItemInventoryRequestBuilder = require('./requestBuilders/item-inventory-request-builder');
const ItemInventoryResponseProcessor = require('./responseProcessors/item-inventory-response-processor');
const CustomerRequestBuilder = require('./requestBuilders/customer-request-builder');
const CustomerResponseProcessor = require('./responseProcessors/customer-response-processor');

// Public
module.exports = {

    /**
     * Fetches all unproccessed qbsdk requests for the current session
     *
     * @param ticket - a ticket used as a session identifier
     */
    fetchRequests: async (ticket) => {
        return await QbsdkQueueItem.find({ticket});
    },

    /**
     * Marks all unprocessed qbsdk requests with the newly created session ticket
     *
     * @param ticket - a ticket used as a session identifier
     *
     * @returns n - the number of unprocessed qbsdk requests
     */
    initializeRequests: async (ticket) => {
        const { n } = await QbsdkQueueItem.updateMany({ processed: false }, { ticket });
        return n;
    },

    /**
     * Called when a qbXML response
     * is returned from QBWC.
     *
     * @param response - qbXML response
     */
    handleResponse: async (ticket, responseInXML) => {
        const response = (await parser.parseStringPromise(responseInXML)).QBXML.QBXMLMsgsRs;
        const body = response[Object.keys(response)[0]];
        const { requestID } = body._attr;

        const queueItem = await QbsdkQueueItem.findOne({ _id: requestID });
        const { resourceType } = queueItem;

        let responseProcessor;

        if (resourceType === 'ItemInventory') {
            responseProcessor = new ItemInventoryResponseProcessor(body, queueItem);
        } else if (resourceType === 'Customer') {
            responseProcessor = new CustomerResponseProcessor(body, queueItem);
        }

        await responseProcessor.process();
    },

    /**
     * Called when there is an error
     * returned processing qbXML from QBWC.
     *
     * @param error - qbXML error response
     */
    didReceiveError: function(error) {
        console.log(error);
    },

    /**
    * Builds a qbXML command from a qbsdk request
    * to be run by QBWC.
    *
    * @param callback(err, requestArray)
    */
    buildXML: async function(ticket) {
        const queueItem = await QbsdkQueueItem.findOne({ ticket });
        if(!queueItem) return '';
        const { resourceType } = queueItem;

        let queryRequestBuilder;

        if(resourceType === 'ItemInventory') {
            queryRequestBuilder = new ItemInventoryRequestBuilder(queueItem);
        } else if (resourceType === 'Customer') {
            queryRequestBuilder = new CustomerRequestBuilder(queueItem);
        }

        const xml = await queryRequestBuilder.buildXML();
        return xml;
    }
}
