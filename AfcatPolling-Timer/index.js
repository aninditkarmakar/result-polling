var request = require('request');

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.IsPastDue)
    {
        context.log('JavaScript is running late!');
    }
    await sendRequest();
    context.log('JavaScript timer trigger function ran!', timeStamp);
    context.done(); 
};

async function sendRequest() {
    return new Promise((resolve, reject) => {
        var url = process.env["FUNCTION_BASE_URL"] + "/AfcatPolling";
        request.get(url)
        .on('response', function(response) {
            resolve(response);
        });
    })
}