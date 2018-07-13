const Events = require('events');
const DeepEqual = require('deep-equal');

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
                        this.cache = data;
                        var rows = data[this.dataKey];
                        for( var i =0; i < rows.length; i++) {
                            this.events.emit('data', rows[i]);
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
