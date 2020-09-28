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
var parseString = require('xml2js').parseString;
const util = require('util')

const QbsdkQueueItem = require('../../lib/models/qbsdk-queue-item');
const ItemInventoryRequestBuilder = require('./requestBuilders/item-inventory-request-builder');

// Public
module.exports = {

    /**
     * Fetches all unproccessed qbsdk requests
     *
     * @param callback(err, requestArray)
     */
    fetchRequests: async () => {
        return await QbsdkQueueItem.find({ processed: false });
    },

    /**
     * Called when a qbXML response
     * is returned from QBWC.
     *
     * @param response - qbXML response
     */
    handleResponse: async (ticket, response) => {
        await QbsdkQueueItem.findOneAndUpdate({ ticket }, { processed: true });
        parseString(response, function(err,result) {
            const trimmed = result;
            console.log(util.inspect(trimmed, { showHidden: false, depth: 10}));
        })

        // console.log(response);
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
    buildXML: async function(ticket, task) {
        const queueItem = await QbsdkQueueItem.findOneAndUpdate({ _id: task._id }, { ticket });
        const { resourceType } = queueItem;

        let queryRequestBuilder;

        if(resourceType === 'ItemInventory') {
            queryRequestBuilder = new ItemInventoryRequestBuilder(queueItem);
        }

        const xml = await queryRequestBuilder.buildXML();
        return xml;
    }
}
