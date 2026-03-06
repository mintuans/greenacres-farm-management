const axios = require('axios');

const test = () => {
    const api = axios.create({
        baseURL: 'http://localhost:5000/api'
    });

    console.log('Base URL: http://localhost:5000/api');

    // Simulating interceptor behavior
    const url = '/api/management/partners';
    console.log('Request URL with interceptor fix: ' + url);

    // We can't actually make a request here easily without a server, 
    // but we can check the config after transformations if we had access to internals.
    // Instead, I'll just check what the documentation says.
};

test();
