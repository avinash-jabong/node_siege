// Configurable parts start
var interval = 1000;
var chunkSize = 100;
var fileLocation = './tag_option';
// Configurable parts end

 Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});

var Promise = require('bluebird');
var pool = require(fileLocation);
var _ = require('lodash');
var pattern = "fe1.jabongfashion";
var AllPromises = [];
var request = Promise.promisify(require('request'));
var success = 0;
var failure = 0;
var filteredPool = [];
_.each(pool, function(option){
   if(option.url.indexOf(pattern) > -1){
       filteredPool.push(option);
   } 
});
var chunks = filteredPool.chunk(chunkSize);

var doSomething = function (chunk, isLast) {
    AllPromises.push(Promise.all(chunk).map(function (option) {
        return request(option).then(function (response) {
            console.log(response[0].request.uri.href + "   <->" + response[0].statusCode);
            success++;
        }).catch(function (err) {
            console.log(option.url + " <-> " + err);
            failure++;
        });
    }));
    if (isLast) {
        Promise.all(AllPromises).then(function (d) {
            console.log("ALL DONE, YAY! :::: success - " +  success + " , failure - " + failure);
        });
    }
};

var i = 0;

var recursiveBullShit = function () {
    if (i < chunks.length) {
        setTimeout(function () {
            doSomething(chunks[i], (i === chunks.length - 1));
            i++;
            recursiveBullShit();
        }, interval)
    }
};

recursiveBullShit();