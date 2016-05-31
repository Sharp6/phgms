"use strict";

var phgms_core = require('../phgms_core');
var mqtt_adapter = require('../mqtt_adapter');
var phgms_sentinel = require('../phgms_sentinel');
var logger = require('../logger');
var phgms_db = require('../phgms_db');


var db = new phgms_db({
	r: require('rethinkdb')
}, {
	dbName: "phgms",
	tableName: "stateChanges"
});

var gms = new phgms_core({
	moment: require('moment'),
	db: db
});

var sentinel = new phgms_sentinel({
	moment: require('moment'),
	logger: logger
}, gms);

var adapter = new mqtt_adapter(
	{
		mqtt: require('mqtt')
	}, 
	{
		mqttHost: "mqtt://192.168.1.124",
		topic: 'phgms/state',
		callback: gms.handleMessage
	}
);

var rest_api = require('../phgms_rest_api/app')(gms);
rest_api.set('port', process.env.PORT || 3000);

var server = rest_api.listen(rest_api.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});