const _ = require('lodash');
const { VALIDATION_CODES } = require('../utils/cms.utils');
const { getEntryField } = require('./contentful-project-service');

// @todo handle 409
const VALIDATION_ERROR_CODES = [422];

class ContentfulError extends Error {
    constructor({ err, entry, spaceId, locale }) {
        super();
        this.formatError({ err, entry, spaceId, locale });
    }

    formatError({ err, entry, spaceId, locale }) {
        let errorObject = {};

        try {
            errorObject = JSON.parse(err.message);
        } catch (e) {}

        const { status } = errorObject;
        if (VALIDATION_ERROR_CODES.includes(status)) {
            const errors = _.get(errorObject, 'details.errors', []).map(error => {
                // ['fields', 'title'] => ['title']
                const fieldPath = _.tail(error.path);
                const fieldValue = getEntryField(entry, fieldPath, locale);
                const srcObjectId = _.get(entry, 'sys.id');
                const message = _.isEmpty(fieldPath) ? error.details : ('Error validating ' + fieldPath.join('.'));
                return {
                    code: VALIDATION_CODES.VALIDATION_FAILED,
                    message,
                    data: {
                        field: {
                            fieldPath,
                            srcObjectId,
                            srcProjectId: spaceId,
                            fieldValue: _.isUndefined(fieldValue) ? '' : fieldValue
                        }
                    }
                };
            });
            this.name = 'Contentful validation error';
            this.message = 'Contentful: ' + errors.map(error => error.message).join('\n');
            this.data = { errors };
        } else {
            this.name = err.name;
            this.message = err.message;
            this.stack = err.stack;
        }
    }
}

module.exports = {
    ContentfulError
};
