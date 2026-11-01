'use strict';
const { loadExternalSuite, evaluateExternalSuite } = require('./external-suite');
module.exports = { ...require('./best-of-n'), loadExternalSuite, evaluateExternalSuite };
