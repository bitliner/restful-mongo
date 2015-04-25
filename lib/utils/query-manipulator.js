module.exports = {
    convertIsoDateInDate: function(query) {
        if (typeof value === 'object' && Array.isArray(query)) {
            return query.map(function(el) {
                return convertIsoDateInDate(el);
            });
        }
        Object.keys(query).forEach(function(key) {
            var value;

            value = query[key];

            if (typeof value === 'object') {
                query[key] = convertIsoDateInDate(query[key]);
            } else if (typeof value === 'string' && value.indexOf('ISODate') >= 0) {
                value = value.replace(/ISODate\(./g, '');
                value = value.replace(/..$/g, '');
                query[key] = new Date(value);
            }
        });
        return query;
    },
    convertFakeObjectIdInObjectId: function(query) {
        if (typeof value === 'object' && Array.isArray(query)) {
            return query.map(function(el) {
                return convertFakeObjectIdInObjectId(el);
            });
        }
        Object.keys(query).forEach(function(key) {
            var value;

            value = query[key];

            Logger.info('-->', value);

            if (typeof value === 'object') {
                query[key] = convertFakeObjectIdInObjectId(query[key]);
            } else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
                Logger.info('----->', 'found objectid', value);
                value = value.replace(/ObjectId\(./g, '');
                value = value.replace(/..$/g, '');
                Logger.info('-----> 2', 'found objectid', value);
                query[key] = new BSON.ObjectID(value);
                Logger.info('Converted', query[key], query[key].constructor.name);
            }
        });
        return query;
    }
};