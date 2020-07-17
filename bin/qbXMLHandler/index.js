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
var mongoUtil = require('../../lib/mongoUtil')
var data2xml = require('data2xml');
var convert = data2xml({
        xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
    });

// Public
module.exports = {

    /**
     * Fetches all unproccessed qbsdk requests
     *
     * @param callback(err, requestArray)
     */
    fetchRequests: function (callback) {
        mongoUtil.getUnprocessedTasks(function(tasks) {
            callback(null, tasks)
        })
    },

    /**
     * Called when a qbXML response
     * is returned from QBWC.
     *
     * @param response - qbXML response
     */
    handleResponse: function(ticket, response) {
        mongoUtil.processTaskByTicket(ticket, function(err) {
            if(err) console.log(err);
        })
        console.log(response);
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
    buildXML: function(ticket, task) {
        mongoUtil.setTicketToTask(task._id, ticket, function(err) {
            if(err) console.log(err);
        });
        var xml = convert(
            'QBXML',
            {
                QBXMLMsgsRq: {
                    _attr: { onError: 'stopOnError' },
                    ItemInventoryQueryRq: {
                        MaxReturned: 1
                    },
                },
            }
        );
        return xml;
    }
}
