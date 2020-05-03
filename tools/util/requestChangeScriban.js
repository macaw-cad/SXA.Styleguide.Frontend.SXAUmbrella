const fs = require('fs');
const path = require('path');
const request = require('request');
require('colors');

const updateScribanPath = '/-/script/v2/master/ChangeScriban';

const scribanFileFilter = name => /(\.(scriban)$)/i.test(name);

const getScribanFiles = dir => {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getScribanFiles(file));
        } else {
            if (scribanFileFilter(file)) {
                results.push(file);
            }
        }
    });
    return results;
}

const getPayload = renderingVariantsRootPath => {
    var streams = []
    getScribanFiles(renderingVariantsRootPath).forEach((scribanFile) => {
        var content = fs.readFileSync(scribanFile, 'utf8');
        if (content.replace(/\s/g, '').length < 1) {
            throw new Error(`Scriban import for '${filePath}' failed because file is empty`);
        }
        var b = Buffer.from(content, 'utf-8');
        var obj = {
            path: scribanFile.replace(/\\/g, '/'),
            content: b.toString('base64')
        };
        streams.push(obj);
    });
    return streams;
}

module.exports = (renderingVariantsRootPath, filePath, context) => {
    try {
        const relativeRenderingVariantsRootPath = path.relative(global.rootPath, renderingVariantsRootPath).replace(/\\/g,'/');
        if (!relativeRenderingVariantsRootPath.endsWith('/-/scriban')) {
            throw new Error(`Scriban import for '${filePath}' failed because 'metadata.json', rendering variants and .scriban files MUST be in a folder '.../-/scriban'`);
        }
        const url = `${context.server}${updateScribanPath}?user=${context.user.login}&password=${context.user.password}&path=${filePath}`;
        var formData = {
            streams: JSON.stringify(getPayload(renderingVariantsRootPath)),
            metadata: JSON.stringify(JSON.parse(fs.readFileSync(path.resolve(renderingVariantsRootPath, 'metadata.json'))))
        };

        request.post({
            url: url,
            formData: formData,
            agentOptions: {
                rejectUnauthorized: false
            }
        }, (err, httpResponse, body) => {
            if (err) {
                throw new Error(`Scriban import failed for Scriban files in the folder '${relativeRenderingVariantsRootPath}': ${err}`);
            } else if (httpResponse.statusCode !== 200) {
                throw new Error(`Scriban import failed for Scriban files in the folder '${relativeRenderingVariantsRootPath}'` +
                                `Status code: ${httpResponse.statusCode}, status message: ${httpResponse.statusMessage}`);
            } else {
                console.log(`Scriban import was successful for Scriban files in the folder '${relativeRenderingVariantsRootPath}'!`.green);
            }
        });
    } catch(err) {
        console.log(`Error: ${err}`.red);
    }
}