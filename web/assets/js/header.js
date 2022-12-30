$(async function () {
    console.log(location.href, Cookies.get('auth'))
    if (Cookies.get('auth')) {
        if (location.pathname.includes('/login.html')) {
            location.replace('index.html')
        }
        $("ul #login-nav").hide()
        $("ul #user-nav").show()
        const resp = await service.get('/auth')
        if (resp.data?.role === 'ADMIN') {
            $('#admin-menu').show()
        } else {
            $('#admin-menu').hide()
        }
    } else {
        $("ul #login-nav").show()
        $("ul #user-nav").hide()
        $('#admin-menu').hide()
    }
    $("#logout-btn").click(function () {
        Cookies.remove('auth')
        location.replace('index.html')
    })
})