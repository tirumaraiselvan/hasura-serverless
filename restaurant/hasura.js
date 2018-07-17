const Events = require('events');
const DeepEqual = require('deep-equal');
const uuidv1 = require('uuid/v1');

module.exports = {
    subscribe: function(client, query, variables, dataKey) {
        var eventEmitter = new Events.EventEmitter();
        var subscriber = {
            client: client,
            query: query,
            variables: variables,
            dataKey: dataKey,
            events: eventEmitter,
            poller: null,
            cache: {},
            getQuery: function () {
                this.client.request(this.query, this.variables)
                .then(data =>{
                    if (!DeepEqual(this.cache, data)){
                        //deep copy data into cache
                        this.cache = JSON.parse(JSON.stringify(data));
                        var batchId = uuidv1();
                        var rows = data[this.dataKey];
                        var timeoutSeconds = 0;
                        for( var i =0; i < rows.length; i++) {
                            timeoutSeconds++;
                            var eventData = {
                                data: rows[i],
                                batchId: batchId
                            };
                            var dis = this;
                            setTimeout(
                                (function(data) {
                                    return function() {
                                    dis.events.emit('data', data);
                                    };
                                })(eventData), timeoutSeconds* 1000);
                        }
                    }
                })
                .catch(err => {
                    console.log("error: ", err);
                });
            },
            start: function () {
                var boundGetQuery = this.getQuery.bind(this);
                this.poller = setInterval(boundGetQuery, 5000);

            },
            end: function () {
                clearInterval(this.poller);
                this.poller = null;
            }

        };
        return subscriber;
    }
}
