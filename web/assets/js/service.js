var service = axios.create({
    baseURL: 'http://localhost:3000'
})

service.interceptors.request.use(function (config) {
    const token = Cookies.get('auth')
    if (token) {
        config.headers.auth = token
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

service.interceptors.response.use(function (response) {
    if (response.config.url === '/auth/login') {
        Cookies.set('auth', response.data.token)
    }
    return response;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
