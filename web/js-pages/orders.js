$(function () {

    const $sortBtn = $('#sort-btn')

    $("#preloader").animate({
        'opacity': '0'
    }, 600, function () {
        setTimeout(function () {
            $("#preloader").css("visibility", "hidden").fadeOut();
        }, 300);
    });

    $("#create-btn").click(function () {
        location.href = 'order-detail.html'
    })

    $sortBtn.click(function () {
        const $ic = $sortBtn.find('i')
        if ($ic.hasClass('fa-chevron-up')) {
            $ic.removeClass('fa-chevron-up').addClass('fa-chevron-down')
            getOrders('DESC')
        } else {
            $ic.removeClass('fa-chevron-down').addClass('fa-chevron-up')
            getOrders('ASC')
        }
    })

    getOrders()

    async function getOrders(sort = 'DESC') {

        $('div .order-item').remove()

        const resp = await service.get(`/order?sort=${sort}`)

        const { orders } = resp.data

        if (!orders.some(od => od.status === 'COMPLETED')) {
            $('#completed-tab-pane #order-empty').removeClass('d-none').addClass('d-flex')
        }

        if (!orders.some(od => od.status === 'CANCELLED')) {
            $('#cancelled-tab-pane #order-empty').removeClass('d-none').addClass('d-flex')
        }

        if (!orders.some(od => od.status === 'SUBMITTED')) {
            $('#submitted-tab-pane #order-empty').removeClass('d-none').addClass('d-flex')
        }

        resp.data.orders.forEach(function (od) {
            const { datetime, numOfGuests, message, user, status } = od
            const $od = $(`
                <div class="order-item p-3 w-100">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${new Date(datetime).toLocaleDateString()}</h5>
                        <small>${numOfGuests} guests</small>
                    </div>
                    <p class="mb-1">${user.fullName}</p>
                    <small>${message ? message : 'No message'}</small>
                </div>
            `)
            $od.click(function () {
                location.href = `order-detail.html?id=${od.id}`
            })
            if (status === 'SUBMITTED') {
                $('#submitted-tab-pane .orders-container').append($od)
            } else if (status === 'CANCELLED') {
                $('#cancelled-tab-pane .orders-container').append($od)
            } else {
                $('#completed-tab-pane .orders-container').append($od)
            }
        })
    }
})