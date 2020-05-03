const fs = require('fs');
const request = require('request');
require('colors');

const uploadScriptPath = '/sitecore modules/PowerShell/Services/RemoteScriptCall.ashx';

module.exports = function (filePath, destinationPath, context) {
    const url = `${context.server}${uploadScriptPath}?user=${context.user.login}&password=${context.user.password}&script=${context.destinationPath}&sc_database=master&apiVersion=media&scriptDb=master`;
    const formData = { file: fs.createReadStream(filePath) };

    request.post({
        url: url,
        formData: formData,
        agentOptions : {
            rejectUnauthorized :false
        }
    }, (err, httpResponse, body) => {
        if (err) {
            console.log(`Upload of '${destinationPath}' failed: ${err}`.red);
        } else if (httpResponse.statusCode !== 200) {
            console.log(`Upload of '${destinationPath}' failed`.red);
            console.log(`Status code: ${httpResponse.statusCode}, status message: ${httpResponse.statusMessage}`.red);
        } else {
            console.log(`Upload of '${destinationPath}' was successful!`.green);
        }
    });
}