var request = require('request');

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.IsPastDue)
    {
        context.log('JavaScript is running late!');
    }
    await sendRequest(context);
    context.log('JavaScript timer trigger function ran!', timeStamp);
    context.done(); 
};

async function sendRequest(context) {
    return new Promise((resolve, reject) => {
        var url = process.env["FUNCTION_BASE_URL"] + "/AfcatPolling";
        request({
            method: 'GET',
            uri: url
        },
        function(err, res, body) {
            if(!err && res.statusCode === 200) {
                context.log(body);
                resolve(body);
                return;
            }
            reject(err.message);
            return;
        });
    })
}