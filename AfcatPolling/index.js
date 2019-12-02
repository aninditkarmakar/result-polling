var request = require('request');
var cheerio = require('cheerio');

module.exports = async function (context, myTimer, req) {
    var timeStamp = new Date().toISOString();

    if (myTimer.IsPastDue) {
        context.log('JavaScript is running late!');
    }

    var afcatHtml = '';
    try {
        afcatHtml = await getAfcat(context);
    }
    catch (ex) {
        context.res = { body: ex };
        context.done();
        return;
    }

    var dom = cheerio.load(afcatHtml);
    var newsList = dom("#newsContent marquee a");
    var returnObject = { titles: [], containsResult: false, url: '' };
    for (var i = 0; i < newsList.length; i++) {
        var news = newsList[i];
        var title = news.children[0].data;
        returnObject.titles.push(title);

        if (isTheTitle(title)) {
            returnObject.containsResult = true;
            if (news.attribs.href) {
                returnObject.url = encodeURI("https://afcat.cdac.in/AFCAT/" + news.attribs.href);
            }
        }
    }

    if (returnObject.containsResult) {
        try {
            await sendNotification(returnObject.url);
        }
        catch (ex) {
            returnObject.message = ex;
        }
    }

    context.res = {
        body: returnObject
    };

    context.log('JavaScript timer trigger function ran!', timeStamp);
    context.done();
};

async function sendNotification(url) {
    return new Promise((resolve, reject) => {
        var endpointurl = process.env["NOTIFICATION_ENDPOINT"];
        var options = {
            uri: endpointurl,
            method: 'POST',
            json: {
                url: url
            }
        };
        request.post(options, (err, res, body) => {
            if(err) {
                reject(`Error sending notification: ${err.message}`);
                return;
            }

            resolve();
        });
    });
}

function isTheTitle(title) {
    title = title.toLowerCase();

    if (title.indexOf('merit list') !== -1 && title.indexOf('20') !== -1) {
        return true;
    }
}

async function getAfcat(context) {
    return new Promise((resolve, reject) => {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        request.get('https://afcat.cdac.in/AFCAT', (err, res, body) => {
            if (err) {
                reject(err.message);
                return;
            }

            context.log('Status code: ' + res.statusCode)
            resolve(body);
        });
    });
}