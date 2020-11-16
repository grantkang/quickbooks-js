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

/*
 * Web-Service.js
 *
 * This class builds the SOAP
 * web-service methods called by
 * Quickbooks Web Connector.
 */

//////////////////
//
// Private
//
//////////////////

/**
 * A reference to the semvar library.
 * https://www.npmjs.com/package/semver
 *
 * @type {SemVer}
 */
var semver = require('semver');

/**
 * A library to generate UUIDs
 *
 * https://github.com/broofa/node-uuid
 */
var uuid = require('node-uuid');

/**
 * A constant for the minimum supported
 * version of the Quickbooks Web Connector.
 *
 * @type {string}
 */
var MIN_SUPPORTED_VERSION = '1.0.0';

/**
 * A constant for the recommended version
 * of Quickbooks Web Connector.
 *
 * @type {string}
 */
var RECOMMENDED_VERSION = '2.0.1';

/**
 * The SOAP web service functions
 * and their defintions.
 */
var webService;

/**
 * Used to keep track of the number
 * of qbXML commands needed to be sent.
 *
 * @type {int}
 */
var counter = 0;

var lastError = '';

/**
 * The username to authenticate against
 * Quickbooks with.
 *
 * @type {string}
 */
var username = process.env.QB_USERNAME || 'username';

/**
 * The password to authenticate against
 * Quickbooks with.
 *
 * @type {string}
 */
var password = process.env.QB_PASSWORD || 'password';

/**
 * The path to the company file that
 * Quickbooks should load. Leave an empty
 * String to use the file Quickbooks currently
 * has open.
 *
 * @type {string}
 */
var companyFile = process.env.QB_COMPANY_FILE || {};

/**
 * A delegate to handle fetching
 * and receiving qbXML requests and responses.
 *
 * @type {Object}
 */
var qbXMLHandler = new Object();

webService = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {}
    }
};

/**
 * Communicates this web service's version
 * number to the QBWC.
 *
 * @return the version of this web service
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.serverVersion = function () {
    var retVal = '0.2.0';

    return {
        serverVersionResult: {'string': retVal}
    };
};

/**
 * Allows the web service to evaluate the current
 * QBWebConnector version
 *
 * @return
 * - `NULL` or '' (empty string) - if you want QBWC to proceed.
 * - 'W:<any text>' - prompts a WARNING to the user.
 * - 'E:<any text>' - prompts an ERROR to the user.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.clientVersion = function(args) {
    var retVal = '';
    var qbwcVersion = args.strVersion.split('.')[0] + '.' +
        args.strVersion.split('.')[1] + '.' +
        args.strVersion.split('.')[2];

    // Check if qbwcVersion is less than minimum supported.
    if (semver.lt(qbwcVersion, MIN_SUPPORTED_VERSION)) {
        retVal = 'E:You need to upgrade your QBWebConnector';
    }
    // Check if qbwcVersion is less than recommended version.
    else if (semver.lt(qbwcVersion, RECOMMENDED_VERSION)) {
        retVal = 'W:It is recommended that you upgrade your QBWebConnector';
    }

    return {
        clientVersionResult: {'string': retVal}
    };
};

/**
 * Allows for the web service to authenticate the user
 * QBWC is using and to specify the company file to be used
 * in the session.
 *
 * @return - array
 * - [0] index 0 is always a UUID for the session
 * - [1] NONE        - if there are no requests to process
 *       ''          - if QBWC is to use the currently open company file
 *       <file path> - the full path to the company file that should be used
 *       nvu         - the username and password were invalid
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.authenticate = async function(args) {
    var authReturn = [];
    const ticket = uuid.v1();
    authReturn[0] = ticket;

    if (args.strUserName.trim() === username && args.strPassword.trim() === password) {
        // Check if qbXMLHandler responds to method.
        if ((typeof qbXMLHandler.initializeRequests === "function")) {
            const numberOfUnprocessedRequests = await qbXMLHandler.initializeRequests(ticket);
            authReturn[1] = numberOfUnprocessedRequests === 0 ? 'NONE' : companyFile;
        } else {
            // Fallback to 'NONE'
            authReturn[1] = 'NONE';
        }
    } else {
        // The username and password sent from
        // QBWC do not match was is set on the server.
        authReturn[1] = 'nvu';
    }

    return {
        authenticateResult: { 'string': [authReturn[0], authReturn[1]] }
    };
};

/**
 * Sends any qbXML commands to be executes to the
 * QBWC client. This method is called continuously until it
 * receives an empty string.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.sendRequestXML = async function(args) {
    const ticket = args ? args.ticket : '';
    const requestXML = await qbXMLHandler.buildXML(ticket);

    return {
        sendRequestXMLResult: { 'string': requestXML }
    };
};

/**
 * Called after QBWC has run a qbXML command
 * and has returned a response.
 *
 * @return {Number} the percentage of requests complete.
 * - Greater than 0 - more requests to send
 * - 100 - Done; no more requests to process
 * - Less than 0 - An error occurred
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.receiveResponseXML = async function(args) {
    try {
        var response = args.response;
        var hresult = args.hresult;
        var message = args.message;
        var ticket = args.ticket;
        var retVal = 0;
        var percentage = 0;

        if (hresult) {
            // if there was an error
            // the web service should return a
            // negative value.
            // console.log("QB CONNECTION ERROR: " + args.message + ' (' + args.hresult + ')');
            lastError = message;
            retVal = -101;

            if ((typeof qbXMLHandler.didReceiveError === "function")) {
                qbXMLHandler.didReceiveError(hresult);
            }
        } else {
            if ((typeof qbXMLHandler.handleResponse === "function")) {
                await qbXMLHandler.handleResponse(ticket, response);
            }
            const currentRequests = await qbXMLHandler.fetchRequests(ticket);
            const processedRequests = currentRequests.filter(requests => requests.processed);
            percentage = processedRequests.length / currentRequests.length * 100;
            if (percentage === 0) percentage = 1;
            retVal = Math.floor(percentage);
        }

        return {
            receiveResponseXMLResult: { 'int': retVal }
        };
    } catch (error) {
        console.log(error);
    }
};

/**
 * Called when there is an error connecting to QB.
 *
 * @return 'DONE' to abort or '' to retry.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.connectionError = function(args) {
    // console.log("QB CONNECTION ERROR: " + args.message + ' (' + args.hresult + ')');
    lastError = args.message;
    var retVal = 'DONE';

    return {
        connectionErrorResult: { 'string': retVal }
    };
};

/**
 * Called when there is an error connecting to QB.
 * Currently just saves off any errors and returns the latest one.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.getLastError = function(args) {
    var retVal = lastError;

    return {
        getLastErrorResult:  { 'string': retVal }
    };
};

/**
 * Tells QBWC is finished with the session.
 *
 * @return 'OK'
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.closeConnection = function(args) {
    var retVal = 'OK';
    return {
        closeConnectionResult: { 'string': retVal }
    };
};

//////////////////
//
// Public
//
//////////////////

module.exports = {
    service: webService,

    setQBXMLHandler: function(xmlHandler) {
        qbXMLHandler = xmlHandler;
    }
};
